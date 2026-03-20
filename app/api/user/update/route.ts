import { NextRequest } from 'next/server'
import { eq, and, ne } from 'drizzle-orm'
import { z } from 'zod'
import { hasPermissionCode, requireRequestAuth } from '@/lib/api/auth'
import { createIdArraySchema } from '@/lib/api/schemas'
import {
  createIdSchema,
  emailSchema,
  normalizeOptionalText,
  parseJsonBody,
  statusSchema,
  usernameSchema,
} from '@/lib/api/validation'
import { hashPassword } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCurrentDateTime } from '@/lib/datetime'
import { sysUser, sysUserRole } from '@/lib/db/schema'
import { ok, fail, forbidden as forbiddenResult } from '@/lib/result'

const updateUserSchema = z.object({
  id: createIdSchema('用户ID'),
  username: usernameSchema.optional(),
  email: emailSchema.optional(),
  password: z.string().optional().nullable()
    .refine(value => value === undefined || value === null || value === '' || value.length >= 6, '密码至少6个字符'),
  nickname: z.string().trim().max(255, '昵称长度不能超过255').optional().nullable(),
  status: statusSchema.optional(),
  roleIds: createIdArraySchema('角色ID').optional(),
})

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth()
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, updateUserSchema)
  if (!parsed.success) {
    return parsed.response
  }

  const auth = guard.auth
  const { id, username, email, password, nickname, status, roleIds } = parsed.data
  const now = getCurrentDateTime()

  const existing = db.select().from(sysUser).where(eq(sysUser.id, id)).get()
  if (!existing) {
    return fail('用户不存在')
  }

  const isSelf = auth.userId === id
  const canManageUsers = hasPermissionCode(auth, 'user:update')

  if (!isSelf && !canManageUsers) {
    return forbiddenResult('无权限修改该用户')
  }

  const updates: Record<string, unknown> = {}
  let touched = false

  if (isSelf && !canManageUsers) {
    if (nickname !== undefined && nickname !== null) {
      updates.nickname = normalizeOptionalText(nickname) ?? null
      touched = true
    }
  } else {
    if (username !== undefined && username !== null && username !== existing.username) {
      const dup = db.select({ id: sysUser.id }).from(sysUser)
        .where(and(eq(sysUser.username, username), ne(sysUser.id, id))).get()
      if (dup) {
        return fail('用户名已存在')
      }
      updates.username = username
      touched = true
    }

    if (email !== undefined && email !== null && email !== existing.email) {
      const dup = db.select({ id: sysUser.id }).from(sysUser)
        .where(and(eq(sysUser.email, email), ne(sysUser.id, id))).get()
      if (dup) {
        return fail('邮箱已被使用')
      }
      updates.email = email
      touched = true
    }

    if (nickname !== undefined) {
      updates.nickname = normalizeOptionalText(nickname) ?? null
      touched = true
    }

    if (status !== undefined && status !== null) {
      updates.status = status
      if (status === 1 && !existing.activatedAt) {
        updates.activatedAt = now
      }
      touched = true
    }

    if (password !== undefined && password !== null && password !== '') {
      updates.password = hashPassword(password)
      touched = true
    }

    if (!isSelf && roleIds !== undefined) {
      db.delete(sysUserRole).where(eq(sysUserRole.userId, id)).run()
      for (const roleId of roleIds) {
        db.insert(sysUserRole).values({ userId: id, roleId }).run()
      }
      touched = true
    }
  }

  if (touched) {
    updates.updatedAt = now
  }

  if (Object.keys(updates).length > 0) {
    db.update(sysUser).set(updates).where(eq(sysUser.id, id)).run()
  }

  return ok()
}
