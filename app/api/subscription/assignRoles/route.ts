import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireRequestAuth } from '@/lib/api/auth'
import { createIdArraySchema } from '@/lib/api/schemas'
import { createIdSchema, parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { getCurrentDateTime } from '@/lib/datetime'
import { sysSubscription, sysSubscriptionRole } from '@/lib/db/schema'
import { ok } from '@/lib/result'
import { eq } from 'drizzle-orm'

const assignRolesSchema = z.object({
  id: createIdSchema('订阅ID'),
  roleIds: createIdArraySchema('角色ID').optional().default([]),
})

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth('subscription:assignRoles')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, assignRolesSchema)
  if (!parsed.success) {
    return parsed.response
  }

  const { id, roleIds } = parsed.data

  db.delete(sysSubscriptionRole)
    .where(eq(sysSubscriptionRole.subscriptionId, id))
    .run()

  if (roleIds.length > 0) {
    db.insert(sysSubscriptionRole)
      .values(roleIds.map((roleId: number) => ({ subscriptionId: id, roleId })))
      .run()
  }

  db.update(sysSubscription)
    .set({ updatedAt: getCurrentDateTime() })
    .where(eq(sysSubscription.id, id))
    .run()

  return ok()
}
