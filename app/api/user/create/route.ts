import { NextRequest } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { requireRequestAuth } from '@/lib/api/auth'
import { createIdArraySchema } from '@/lib/api/schemas'
import {
  emailSchema,
  normalizeOptionalText,
  parseJsonBody,
  passwordSchema,
  statusSchema,
  usernameSchema,
} from '@/lib/api/validation'
import { hashPassword } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCurrentDateTime } from '@/lib/datetime'
import { sysUser, sysUserRole } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'

const createUserSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  nickname: z.string().trim().max(255, '昵称长度不能超过255').optional().nullable(),
  status: statusSchema.default(1),
  roleIds: createIdArraySchema('角色ID').optional().default([]),
})

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth('user:create')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, createUserSchema)
  if (!parsed.success) {
    return parsed.response
  }

  const { username, email, password, nickname, status, roleIds } = parsed.data

  const existingUsername = db.select({ id: sysUser.id }).from(sysUser).where(eq(sysUser.username, username)).get()
  if (existingUsername) {
    return fail('用户名已存在')
  }

  const existingEmail = db.select({ id: sysUser.id }).from(sysUser).where(eq(sysUser.email, email)).get()
  if (existingEmail) {
    return fail('邮箱已被使用')
  }

  const hashed = hashPassword(password)
  const activatedAt = status === 1 ? getCurrentDateTime() : null
  const result = db.insert(sysUser).values({
    username,
    email,
    password: hashed,
    nickname: normalizeOptionalText(nickname) ?? null,
    status,
    activatedAt,
  }).run()

  if (roleIds.length > 0) {
    const userId = Number(result.lastInsertRowid)
    for (const roleId of roleIds) {
      db.insert(sysUserRole).values({ userId, roleId }).run()
    }
  }

  return ok()
}
