import { NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import { registerSchema } from '@/lib/api/schemas'
import { parseJsonBody } from '@/lib/api/validation'
import { hashPassword, signActivationToken } from '@/lib/auth'
import { getSiteDomain } from '@/lib/config'
import { db } from '@/lib/db'
import { sysUser, sysUserRole } from '@/lib/db/schema'
import { sendMail, buildActivationMailHtml } from '@/lib/mail'
import { ok, fail } from '@/lib/result'

const USER_ROLE_ID = 3

export async function POST(request: NextRequest) {
  const parsed = await parseJsonBody(request, registerSchema)
  if (!parsed.success) {
    return parsed.response
  }

  const { username, email, password } = parsed.data

  const existingUsername = db.select({ id: sysUser.id }).from(sysUser).where(eq(sysUser.username, username)).get()
  if (existingUsername) {
    return fail('用户名已存在')
  }

  const existingEmail = db.select({ id: sysUser.id }).from(sysUser).where(eq(sysUser.email, email)).get()
  if (existingEmail) {
    return fail('邮箱已被使用')
  }

  const domain = getSiteDomain()
  if (!domain) {
    return fail('系统未配置站点域名，无法发送激活邮件，请联系管理员')
  }

  const hashed = hashPassword(password)
  const result = db.insert(sysUser).values({
    username,
    email,
    password: hashed,
    nickname: username,
    status: 0,
  }).run()

  const userId = Number(result.lastInsertRowid)
  db.insert(sysUserRole).values({ userId, roleId: USER_ROLE_ID }).run()

  try {
    const token = await signActivationToken(userId)
    const activationUrl = `${domain}/activate?token=${token}`
    const html = buildActivationMailHtml(activationUrl)
    await sendMail(email, 'SubGate 账号激活', html)
  } catch {
    return ok(
      {
        activationMailSent: false,
        message: '注册成功，但激活邮件发送失败，请稍后在登录页重新发送激活邮件。',
      },
      '注册成功'
    )
  }

  return ok(
    {
      activationMailSent: true,
      message: '激活邮件已发送到您的邮箱，请查收并点击激活链接完成注册。',
    },
    '注册成功'
  )
}
