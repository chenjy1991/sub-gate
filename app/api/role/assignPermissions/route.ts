import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireRequestAuth } from '@/lib/api/auth'
import { createIdArraySchema } from '@/lib/api/schemas'
import { createIdSchema, parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { getCurrentDateTime } from '@/lib/datetime'
import { ok } from '@/lib/result'
import { sysRole, sysRolePermission } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const assignPermissionsSchema = z.object({
  roleId: createIdSchema('角色ID'),
  permissionIds: createIdArraySchema('权限ID').optional().default([]),
})

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth('role:assign')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, assignPermissionsSchema)
  if (!parsed.success) {
    return parsed.response
  }

  const { roleId, permissionIds } = parsed.data

  db.delete(sysRolePermission).where(eq(sysRolePermission.roleId, roleId)).run()

  if (permissionIds.length > 0) {
    for (const permissionId of permissionIds) {
      db.insert(sysRolePermission).values({ roleId, permissionId }).run()
    }
  }

  db.update(sysRole)
    .set({ updatedAt: getCurrentDateTime() })
    .where(eq(sysRole.id, roleId))
    .run()

  return ok()
}
