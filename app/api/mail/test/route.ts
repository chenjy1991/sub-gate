import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireRequestAuth } from '@/lib/api/auth'
import { emailSchema, parseJsonBody } from '@/lib/api/validation'
import { getMailConfig, sendMail, buildTestMailHtml } from '@/lib/mail'
import { ok, fail } from '@/lib/result'

const mailTestSchema = z.object({
  to: emailSchema,
})

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth('mail:test')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, mailTestSchema)
  if (!parsed.success) {
    return parsed.response
  }

  const { to } = parsed.data

  const config = getMailConfig()
  if (!config) {
    return fail('邮件配置未设置，请先保存 SMTP 配置')
  }

  if (!config.host || !config.port || !config.user || !config.pass) {
    return fail('邮件配置不完整，请检查 SMTP 参数')
  }

  try {
    const html = buildTestMailHtml(config)
    await sendMail(to, 'SubGate 邮件配置测试', html)
    return ok()
  } catch (e) {
    const msg = e instanceof Error ? e.message : '发送失败'
    return fail(`发送失败：${msg}`)
  }
}
