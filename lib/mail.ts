import nodemailer from 'nodemailer'
import { db } from './db'
import { sysConfig } from './db/schema'
import { eq } from 'drizzle-orm'

export interface MailConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
}

export function getMailConfig(): MailConfig | null {
  const row = db.select().from(sysConfig)
    .where(eq(sysConfig.configKey, 'mail')).get()
  if (!row || !row.configValue) return null
  try {
    return JSON.parse(row.configValue)
  } catch {
    return null
  }
}

export async function sendMail(to: string, subject: string, html: string) {
  const config = getMailConfig()
  if (!config) throw new Error('邮件配置未设置，请先在系统管理中配置 SMTP 参数')

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  })

  await transporter.sendMail({
    from: config.from,
    to,
    subject,
    html,
  })
}

export function buildTestMailHtml(config: MailConfig): string {
  const time = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f5; padding: 40px 0;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: #18181b; padding: 24px 32px;">
      <h1 style="margin: 0; color: #fff; font-size: 20px; font-weight: 600;">SubGate</h1>
    </div>
    <div style="padding: 32px;">
      <h2 style="margin: 0 0 16px; color: #18181b; font-size: 18px;">邮件配置测试成功</h2>
      <p style="color: #52525b; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
        如果您收到了这封邮件，说明 SMTP 邮件发送配置正确。
      </p>
      <div style="background: #f4f4f5; border-radius: 6px; padding: 16px; font-size: 13px; color: #3f3f46;">
        <div style="margin-bottom: 8px;"><strong>SMTP 服务器：</strong>${config.host}</div>
        <div style="margin-bottom: 8px;"><strong>端口：</strong>${config.port}</div>
        <div style="margin-bottom: 8px;"><strong>加密：</strong>${config.secure ? 'SSL/TLS' : '无'}</div>
        <div><strong>发件人：</strong>${config.from}</div>
      </div>
      <p style="color: #a1a1aa; font-size: 12px; margin: 24px 0 0;">发送时间：${time}</p>
    </div>
  </div>
</body>
</html>`
}

export function buildActivationMailHtml(activationUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f5; padding: 40px 0;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: #18181b; padding: 24px 32px;">
      <h1 style="margin: 0; color: #fff; font-size: 20px; font-weight: 600;">SubGate</h1>
    </div>
    <div style="padding: 32px;">
      <h2 style="margin: 0 0 16px; color: #18181b; font-size: 18px;">激活您的账号</h2>
      <p style="color: #52525b; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
        感谢您注册 SubGate。请点击下方按钮激活您的账号：
      </p>
      <div style="text-align: center; margin: 0 0 24px;">
        <a href="${activationUrl}" style="display: inline-block; background: #7c3aed; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-size: 14px; font-weight: 500;">激活账号</a>
      </div>
      <p style="color: #71717a; font-size: 13px; line-height: 1.6; margin: 0 0 16px;">
        如果按钮无法点击，请复制以下链接到浏览器打开：
      </p>
      <p style="color: #7c3aed; font-size: 12px; word-break: break-all; margin: 0 0 24px;">${activationUrl}</p>
      <p style="color: #a1a1aa; font-size: 12px; margin: 0;">此链接 24 小时内有效。如果您没有注册过 SubGate，请忽略此邮件。</p>
    </div>
  </div>
</body>
</html>`
}
