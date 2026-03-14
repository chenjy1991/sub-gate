import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, fail } from '@/lib/result'
import { sysUser } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { verifyActivationToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { token } = body

  if (!token) {
    return fail('缺少激活 token')
  }

  const payload = await verifyActivationToken(token)
  if (!payload) {
    return fail('激活链接无效或已过期，请重新发送激活邮件')
  }

  const user = db.select().from(sysUser).where(eq(sysUser.id, payload.userId)).get()
  if (!user) {
    return fail('用户不存在')
  }

  if (user.status === 1) {
    return fail('账号已激活，无需重复操作')
  }

  db.update(sysUser).set({ status: 1 }).where(eq(sysUser.id, payload.userId)).run()

  return ok()
}
