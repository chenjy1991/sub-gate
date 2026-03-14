import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, fail } from '@/lib/result'
import { sysUser, sysUserRole } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword } from '@/lib/auth'

const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9]*$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { username, email, password, nickname, status = 1, roleIds } = body

  if (!username || !password || !email) {
    return fail('用户名、邮箱和密码不能为空')
  }

  if (!USERNAME_REGEX.test(username)) {
    return fail('用户名只能包含英文和数字，且必须英文开头')
  }

  if (!EMAIL_REGEX.test(email)) {
    return fail('邮箱格式不正确')
  }

  const existingUsername = db.select({ id: sysUser.id }).from(sysUser).where(eq(sysUser.username, username)).get()
  if (existingUsername) {
    return fail('用户名已存在')
  }

  const existingEmail = db.select({ id: sysUser.id }).from(sysUser).where(eq(sysUser.email, email)).get()
  if (existingEmail) {
    return fail('邮箱已被使用')
  }

  const hashed = hashPassword(password)
  const result = db.insert(sysUser).values({
    username,
    email,
    password: hashed,
    nickname: nickname || null,
    status,
  }).run()

  if (roleIds && roleIds.length > 0) {
    const userId = Number(result.lastInsertRowid)
    for (const roleId of roleIds) {
      db.insert(sysUserRole).values({ userId, roleId }).run()
    }
  }

  return ok()
}
