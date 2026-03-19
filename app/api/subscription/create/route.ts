import { NextRequest } from 'next/server'
import { requireRequestAuth } from '@/lib/api/auth'
import { subscriptionPayloadSchema } from '@/lib/api/schemas'
import { parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { sysSubscription, sysSubscriptionNode } from '@/lib/db/schema'
import { ok } from '@/lib/result'

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth('subscription:create')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, subscriptionPayloadSchema)
  if (!parsed.success) {
    return parsed.response
  }

  const { name, remark, status, nodeIds } = parsed.data

  const result = db.insert(sysSubscription).values({
    name,
    remark: remark ?? null,
    status,
  }).run()

  const subId = Number(result.lastInsertRowid)

  if (nodeIds.length > 0) {
    db.insert(sysSubscriptionNode)
      .values(nodeIds.map((nodeId: number) => ({ subscriptionId: subId, nodeId })))
      .run()
  }

  return ok()
}
