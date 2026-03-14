import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, fail } from '@/lib/result'
import { sysUser, sysUserRole, sysConfig } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword, signActivationToken } from '@/lib/auth'
import { sendMail, buildActivationMailHtml } from '@/lib/mail'

const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9]*$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USER_ROLE_ID = 3

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
  const { username, email, password } = body

  if (!username || !email || !password) {
    return fail('用户名、邮箱和密码不能为空')
  }

  if (!USERNAME_REGEX.test(username)) {
    return fail('用户名只能包含英文和数字，且必须英文开头')
  }

  if (!EMAIL_REGEX.test(email)) {
    return fail('邮箱格式不正确')
  }

  if (password.length < 6) {
    return fail('密码至少6个字符')
  }

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
  } catch (e) {
    const msg = e instanceof Error ? e.message : '邮件发送失败'
    return fail(`注册成功但激活邮件发送失败：${msg}。请稍后在登录页重新发送激活邮件。`)
  }

  return ok()
}
