import { NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import { loginSchema } from '@/lib/api/schemas'
import { getUserPermissionCodes, getUserRoleCodes } from '@/lib/api/auth'
import { parseJsonBody } from '@/lib/api/validation'
import { verifyPassword, signToken, setAuthCookie } from '@/lib/auth'
import { db } from '@/lib/db'
import { sysLoginLog, sysUser } from '@/lib/db/schema'
import { getCurrentDateTime } from '@/lib/datetime'
import { resolvePrimaryRole } from '@/lib/role'
import { getRequestIp, getRequestUserAgent } from '@/lib/request-meta'
import { ok, fail } from '@/lib/result'

export async function POST(request: NextRequest) {
  const parsed = await parseJsonBody(request, loginSchema)
  if (!parsed.success) {
    return parsed.response
  }

  const { username, password } = parsed.data

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

  const roleCodes = getUserRoleCodes(user.id)
  const role = resolvePrimaryRole(roleCodes)
  const permissions = getUserPermissionCodes(user.id, roleCodes)

  const loginAt = getCurrentDateTime()
  const ip = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)

  try {
    db.update(sysUser)
      .set({ lastLoginAt: loginAt, updatedAt: loginAt })
      .where(eq(sysUser.id, user.id))
      .run()

    db.insert(sysLoginLog).values({
      userId: user.id,
      ip,
      userAgent,
      createdAt: loginAt,
    }).run()
  } catch (error) {
    console.error('记录登录历史失败', error)
  }

  const token = await signToken({ userId: user.id, username: user.username, role })
  await setAuthCookie(token)

  return ok({
    token,
    user: {
      id: user.id,
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
