import { NextRequest } from 'next/server'
import { requireRequestAuth } from '@/lib/api/auth'
import { createEntityIdSchema } from '@/lib/api/schemas'
import { parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { ok } from '@/lib/result'
import { sysUser, sysUserRole } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth('user:delete')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, createEntityIdSchema('用户ID'))
  if (!parsed.success) {
    return parsed.response
  }

  const { id } = parsed.data

  db.delete(sysUserRole).where(eq(sysUserRole.userId, id)).run()
  db.delete(sysUser).where(eq(sysUser.id, id)).run()

  return ok()
}
