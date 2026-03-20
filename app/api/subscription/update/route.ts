import { NextRequest } from 'next/server'
import { requireRequestAuth } from '@/lib/api/auth'
import { subscriptionPayloadSchema } from '@/lib/api/schemas'
import { createIdSchema, parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { getCurrentDateTime } from '@/lib/datetime'
import { sysSubscription, sysSubscriptionNode } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'
import { eq } from 'drizzle-orm'

const updateSubscriptionSchema = subscriptionPayloadSchema.partial().extend({
  id: createIdSchema('订阅ID'),
})

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth('subscription:update')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, updateSubscriptionSchema)
  if (!parsed.success) {
    return parsed.response
  }

  const { id, name, remark, status, nodeIds } = parsed.data

  const existing = db
    .select()
    .from(sysSubscription)
    .where(eq(sysSubscription.id, id))
    .get()

  if (!existing) {
    return fail('订阅不存在')
  }

  const updates: Record<string, unknown> = {}
  let touched = false
  if (name !== undefined) {
    updates.name = name
    touched = true
  }
  if (remark !== undefined) {
    updates.remark = remark
    touched = true
  }
  if (status !== undefined) {
    updates.status = status
    touched = true
  }

  if (nodeIds !== undefined) {
    touched = true
  }

  if (touched) {
    updates.updatedAt = getCurrentDateTime()
  }

  if (Object.keys(updates).length > 0) {
    db.update(sysSubscription)
      .set(updates)
      .where(eq(sysSubscription.id, id))
      .run()
  }

  if (nodeIds !== undefined) {
    db.delete(sysSubscriptionNode)
      .where(eq(sysSubscriptionNode.subscriptionId, id))
      .run()

    if (nodeIds.length > 0) {
      db.insert(sysSubscriptionNode)
        .values(nodeIds.map((nodeId: number) => ({ subscriptionId: id, nodeId })))
        .run()
    }
  }

  return ok()
}
