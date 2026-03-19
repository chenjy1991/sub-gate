import { db } from '@/lib/db'
import { ok, fail } from '@/lib/result'
import { sysUser } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { requireRequestAuth } from '@/lib/api/auth'
import { parseJsonBody, passwordSchema } from '@/lib/api/validation'
import { verifyPassword, hashPassword } from '@/lib/auth'

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, '请输入当前密码'),
  newPassword: passwordSchema,
})

export async function POST(request: Request) {
  const guard = await requireRequestAuth()
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, changePasswordSchema)
  if (!parsed.success) {
    return parsed.response
  }

  const auth = guard.auth
  const { oldPassword, newPassword } = parsed.data

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
