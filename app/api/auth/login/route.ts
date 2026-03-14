import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, fail } from '@/lib/result'
import { sysUser, sysUserRole, sysRole, sysRolePermission, sysPermission } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { verifyPassword, signToken, setAuthCookie } from '@/lib/auth'

function getAncestorCodes(
  code: string,
  allPermissions: { id: number; parentId: number; code: string }[]
): string[] {
  const codes: string[] = []
  const byId = new Map(allPermissions.map(p => [p.id, p]))
  const byCode = allPermissions.find(p => p.code === code)
  if (!byCode) return codes
  let current = byId.get(byCode.parentId)
  while (current) {
    codes.push(current.code)
    current = current.parentId ? byId.get(current.parentId) : undefined
  }
  return codes
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { username, password } = body

  if (!username || !password) {
    return fail('账号和密码不能为空')
  }

  // 含 @ 按 email 查，否则按 username 查
  const isEmail = String(username).includes('@')
  const user = isEmail
    ? db.select().from(sysUser).where(eq(sysUser.email, username)).get()
    : db.select().from(sysUser).where(eq(sysUser.username, username)).get()

  if (!user) {
    return fail('账号或密码错误')
  }

  if (!verifyPassword(password, user.password)) {
    return fail('账号或密码错误')
  }

  if (user.status === 0) {
    return fail('账号未激活，请检查邮箱完成激活')
  }

  // Get role codes
  const userRoles = db
    .select({ code: sysRole.code })
    .from(sysUserRole)
    .innerJoin(sysRole, eq(sysUserRole.roleId, sysRole.id))
    .where(eq(sysUserRole.userId, user.id))
    .all()
  const roleCodes = userRoles.map(r => r.code)

  // Determine primary role
  let role: string
  if (roleCodes.includes('ADMIN')) {
    role = 'admin'
  } else if (roleCodes.includes('VIP')) {
    role = 'vip'
  } else {
    role = 'user'
  }

  // Get permissions
  let permissions: string[]
  if (role === 'admin') {
    permissions = ['*']
  } else {
    const userRoleIds = db
      .select({ roleId: sysUserRole.roleId })
      .from(sysUserRole)
      .where(eq(sysUserRole.userId, user.id))
      .all()
      .map(r => r.roleId)

    if (userRoleIds.length === 0) {
      permissions = []
    } else {
      const rpForUser = db
        .select({ permissionId: sysRolePermission.permissionId, roleId: sysRolePermission.roleId })
        .from(sysRolePermission)
        .all()
        .filter(rp => userRoleIds.includes(rp.roleId))

      const permIds = [...new Set(rpForUser.map(rp => rp.permissionId))]
      const allPerms = db.select().from(sysPermission).all()

      const buttonCodes = allPerms
        .filter(p => permIds.includes(p.id) && p.type === 'button')
        .map(p => p.code)

      const allCodes = new Set<string>(buttonCodes)
      const permMap = allPerms.filter(p => permIds.includes(p.id)).map(p => p.code)
      for (const code of permMap) {
        allCodes.add(code)
      }
      for (const code of buttonCodes) {
        for (const ancestor of getAncestorCodes(code, allPerms)) {
          allCodes.add(ancestor)
        }
      }

      permissions = [...allCodes]
    }
  }

  const token = await signToken({ userId: user.id, username: user.username, role })
  await setAuthCookie(token)

  return ok({
    token,
    user: {
      id: String(user.id),
      username: user.username,
      email: user.email,
      name: user.nickname || user.username,
      role,
      status: user.status === 1 ? 'active' : 'inactive',
      createdAt: user.createdAt,
      permissions,
    },
  })
}
