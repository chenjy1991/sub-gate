import { NextRequest } from 'next/server'
import { eq, inArray, like, or, sql } from 'drizzle-orm'
import { z } from 'zod'
import { requireRequestAuth } from '@/lib/api/auth'
import { paginationSchema } from '@/lib/api/schemas'
import { parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { sysUser, sysUserRole, sysRole } from '@/lib/db/schema'
import { ok } from '@/lib/result'

const userListSchema = paginationSchema.extend({
  username: z.string().trim().optional(),
})

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth('user:list')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, userListSchema)
  if (!parsed.success) {
    return parsed.response
  }

  const { page, size, username } = parsed.data

  let query = db.select({
    id: sysUser.id,
    username: sysUser.username,
    email: sysUser.email,
    nickname: sysUser.nickname,
    status: sysUser.status,
    createdAt: sysUser.createdAt,
  }).from(sysUser).$dynamic()

  let countQuery = db.select({ total: sql<number>`count(*)` }).from(sysUser).$dynamic()

  if (username) {
    const condition = or(
      like(sysUser.username, `%${username}%`),
      like(sysUser.email, `%${username}%`)
    )
    query = query.where(condition)
    countQuery = countQuery.where(condition)
  }

  const [{ total }] = countQuery.all()

  const users = query
    .orderBy(sql`${sysUser.id} desc`)
    .limit(size)
    .offset((page - 1) * size)
    .all()

  const userIds = users.map(user => user.id)
  const roleRows = userIds.length > 0
    ? db
      .select({ userId: sysUserRole.userId, code: sysRole.code })
      .from(sysUserRole)
      .innerJoin(sysRole, eq(sysUserRole.roleId, sysRole.id))
      .where(inArray(sysUserRole.userId, userIds))
      .all()
    : []

  const roleCodesByUserId = new Map<number, string[]>()
  for (const row of roleRows) {
    const codes = roleCodesByUserId.get(row.userId) ?? []
    codes.push(row.code)
    roleCodesByUserId.set(row.userId, codes)
  }

  const list = users.map(user => ({
    ...user,
    roleCodes: roleCodesByUserId.get(user.id) ?? [],
  }))

  return ok({ total, list })
}
