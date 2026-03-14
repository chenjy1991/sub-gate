import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok } from '@/lib/result'
import { sysUser, sysUserRole, sysRole } from '@/lib/db/schema'
import { eq, like, or, sql } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { page = 1, size = 10, username } = body

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

  const list = users.map(user => {
    const roles = db
      .select({ code: sysRole.code })
      .from(sysUserRole)
      .innerJoin(sysRole, eq(sysUserRole.roleId, sysRole.id))
      .where(eq(sysUserRole.userId, user.id))
      .all()
    return {
      ...user,
      roleCodes: roles.map(r => r.code),
    }
  })

  return ok({ total, list })
}
