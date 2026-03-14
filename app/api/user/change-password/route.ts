import { db } from '@/lib/db'
import { ok, fail } from '@/lib/result'
import { sysUser } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getAuthFromCookie, verifyPassword, hashPassword } from '@/lib/auth'

export async function POST(request: Request) {
  const auth = await getAuthFromCookie()
  if (!auth) {
    return fail('未登录')
  }

  const body = await request.json()
  const { oldPassword, newPassword } = body

  if (!oldPassword || !newPassword) {
    return fail('请输入当前密码和新密码')
  }

  if (newPassword.length < 6) {
    return fail('新密码至少6个字符')
  }

  const user = db.select().from(sysUser).where(eq(sysUser.id, auth.userId)).get()
  if (!user) {
    return fail('用户不存在')
  }

  if (!verifyPassword(oldPassword, user.password)) {
    return fail('当前密码错误')
  }

  db.update(sysUser)
    .set({ password: hashPassword(newPassword) })
    .where(eq(sysUser.id, auth.userId))
    .run()

  return ok()
}
