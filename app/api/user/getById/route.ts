import { NextRequest } from 'next/server'
import { createEntityIdSchema } from '@/lib/api/schemas'
import { requireRequestAuth } from '@/lib/api/auth'
import { parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { ok, fail } from '@/lib/result'
import { sysUser, sysUserRole, sysRole } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth('user:list')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, createEntityIdSchema('用户ID'))
  if (!parsed.success) {
    return parsed.response
  }

  const { id } = parsed.data

  const user = db.select({
    id: sysUser.id,
    username: sysUser.username,
    email: sysUser.email,
    nickname: sysUser.nickname,
    status: sysUser.status,
    createdAt: sysUser.createdAt,
  }).from(sysUser).where(eq(sysUser.id, id)).get()

  if (!user) {
    return fail('用户不存在')
  }

  const roles = db
    .select({ code: sysRole.code })
    .from(sysUserRole)
    .innerJoin(sysRole, eq(sysUserRole.roleId, sysRole.id))
    .where(eq(sysUserRole.userId, user.id))
    .all()

  return ok({
    ...user,
    roleCodes: roles.map(r => r.code),
  })
}
