import { NextRequest } from 'next/server'
import { requireRequestAuth } from '@/lib/api/auth'
import { createIdSchema, parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { ok } from '@/lib/result'
import { sysRolePermission } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const getPermissionIdsSchema = z.object({
  roleId: createIdSchema('角色ID'),
})

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth('role:assign')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, getPermissionIdsSchema)
  if (!parsed.success) {
    return parsed.response
  }

  const { roleId } = parsed.data

  const rows = db
    .select({ permissionId: sysRolePermission.permissionId })
    .from(sysRolePermission)
    .where(eq(sysRolePermission.roleId, roleId))
    .all()

  return ok(rows.map(r => r.permissionId))
}
