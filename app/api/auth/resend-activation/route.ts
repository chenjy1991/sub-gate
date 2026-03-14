import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, fail } from '@/lib/result'
import { sysUser, sysConfig } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { signActivationToken } from '@/lib/auth'
import { sendMail, buildActivationMailHtml } from '@/lib/mail'

function getSiteDomain(): string {
  const row = db.select().from(sysConfig).where(eq(sysConfig.configKey, 'site')).get()
  if (!row || !row.configValue) return ''
  try {
    return JSON.parse(row.configValue).domain || ''
  } catch {
    return ''
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email } = body

  if (!email) {
    return fail('请输入邮箱')
  }

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
