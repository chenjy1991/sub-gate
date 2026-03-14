import { db } from '@/lib/db'
import { ok, fail } from '@/lib/result'
import { sysUser, sysUserRole, sysRole } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getAuthFromCookie } from '@/lib/auth'

export async function POST() {
  const auth = await getAuthFromCookie()
  if (!auth) {
    return fail('未登录')
  }

  const user = db.select({
    id: sysUser.id,
    username: sysUser.username,
    email: sysUser.email,
    nickname: sysUser.nickname,
    status: sysUser.status,
    createdAt: sysUser.createdAt,
  }).from(sysUser).where(eq(sysUser.id, auth.userId)).get()

  if (!user) {
    return fail('用户不存在')
  }

  const roles = db
    .select({ code: sysRole.code })
    .from(sysUserRole)
    .innerJoin(sysRole, eq(sysUserRole.roleId, sysRole.id))
    .where(eq(sysUserRole.userId, user.id))
    .all()

  return ok({
    ...user,
    roleCodes: roles.map(r => r.code),
  })
}
