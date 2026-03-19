import { NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { emailSchema } from '@/lib/api/validation'
import { parseJsonBody } from '@/lib/api/validation'
import { signActivationToken } from '@/lib/auth'
import { getSiteDomain } from '@/lib/config'
import { db } from '@/lib/db'
import { sysUser } from '@/lib/db/schema'
import { sendMail, buildActivationMailHtml } from '@/lib/mail'
import { ok, fail } from '@/lib/result'

const resendActivationSchema = z.object({
  email: emailSchema,
})

export async function POST(request: NextRequest) {
  const parsed = await parseJsonBody(request, resendActivationSchema)
  if (!parsed.success) {
    return parsed.response
  }

  const { email } = parsed.data

  const user = db.select().from(sysUser).where(eq(sysUser.email, email)).get()
  if (!user) {
    return fail('该邮箱未注册')
  }

  if (user.status === 1) {
    return fail('账号已激活，请直接登录')
  }

  const domain = getSiteDomain()
  if (!domain) {
    return fail('系统未配置站点域名，无法发送激活邮件，请联系管理员')
  }

  try {
    const token = await signActivationToken(user.id)
    const activationUrl = `${domain}/activate?token=${token}`
    const html = buildActivationMailHtml(activationUrl)
    await sendMail(email, 'SubGate 账号激活', html)
  } catch (e) {
    const msg = e instanceof Error ? e.message : '邮件发送失败'
    return fail(`激活邮件发送失败：${msg}`)
  }

  return ok()
}
