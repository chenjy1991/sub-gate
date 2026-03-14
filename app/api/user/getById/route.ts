import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, fail } from '@/lib/result'
import { sysUser, sysUserRole, sysRole } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { id } = body

  if (!id) {
    return fail('缺少用户ID')
  }

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
