import { NextRequest } from 'next/server'
import { requireRequestAuth } from '@/lib/api/auth'
import { createEntityIdSchema } from '@/lib/api/schemas'
import { parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { ok } from '@/lib/result'
import { sysRole, sysRolePermission } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth('role:delete')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, createEntityIdSchema('角色ID'))
  if (!parsed.success) {
    return parsed.response
  }

  const { id } = parsed.data

  db.delete(sysRolePermission).where(eq(sysRolePermission.roleId, id)).run()
  db.delete(sysRole).where(eq(sysRole.id, id)).run()

  return ok()
}
