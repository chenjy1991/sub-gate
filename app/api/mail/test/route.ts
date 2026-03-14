import { NextRequest } from 'next/server'
import { ok, fail } from '@/lib/result'
import { getMailConfig, sendMail, buildTestMailHtml } from '@/lib/mail'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { to } = body

  if (!to) {
    return fail('请输入收件邮箱')
  }

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
