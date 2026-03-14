import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, fail } from '@/lib/result'
import { sysUser, sysUserRole } from '@/lib/db/schema'
import { eq, and, ne } from 'drizzle-orm'
import { hashPassword, getAuthFromCookie } from '@/lib/auth'

const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9]*$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { id, username, email, password, nickname, status, roleIds } = body

  if (!id) {
    return fail('缺少用户ID')
  }

  const auth = await getAuthFromCookie()
  if (!auth) {
    return fail('未登录')
  }

  const existing = db.select().from(sysUser).where(eq(sysUser.id, id)).get()
  if (!existing) {
    return fail('用户不存在')
  }

  // 判断权限
  const isSelf = auth.userId === id
  const hasUpdatePerm = auth.role === 'admin' // 简化判断，后续可改为检查 user:update 权限

  // 非本人且无权限 → 拒绝
  if (!isSelf && !hasUpdatePerm) {
    return fail('无权限修改该用户')
  }

  const updates: Record<string, unknown> = {}

  if (isSelf && !hasUpdatePerm) {
    // 普通用户编辑自己：只能改 nickname
    if (nickname !== undefined && nickname !== null) {
      updates.nickname = nickname
    }
  } else {
    // 管理员编辑（自己或别人）
    if (username !== undefined && username !== null && username !== existing.username) {
      if (!USERNAME_REGEX.test(username)) {
        return fail('用户名只能包含英文和数字，且必须英文开头')
      }
      const dup = db.select({ id: sysUser.id }).from(sysUser)
        .where(and(eq(sysUser.username, username), ne(sysUser.id, id))).get()
      if (dup) {
        return fail('用户名已存在')
      }
      updates.username = username
    }

    if (email !== undefined && email !== null && email !== existing.email) {
      if (!EMAIL_REGEX.test(email)) {
        return fail('邮箱格式不正确')
      }
      const dup = db.select({ id: sysUser.id }).from(sysUser)
        .where(and(eq(sysUser.email, email), ne(sysUser.id, id))).get()
      if (dup) {
        return fail('邮箱已被使用')
      }
      updates.email = email
    }

    if (nickname !== undefined && nickname !== null) updates.nickname = nickname
    if (status !== undefined && status !== null) updates.status = status
    if (password !== undefined && password !== null && password !== '') {
      updates.password = hashPassword(password)
    }

    // roleIds 只有编辑别人时才允许修改
    if (!isSelf && roleIds !== undefined && roleIds !== null) {
      db.delete(sysUserRole).where(eq(sysUserRole.userId, id)).run()
      for (const roleId of roleIds) {
        db.insert(sysUserRole).values({ userId: id, roleId }).run()
      }
    }
  }

  if (Object.keys(updates).length > 0) {
    db.update(sysUser).set(updates).where(eq(sysUser.id, id)).run()
  }

  return ok()
}
