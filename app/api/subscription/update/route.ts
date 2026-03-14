import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sysSubscription, sysSubscriptionNode } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { id, name, remark, status, nodeIds } = body

  if (!id) {
    return fail('缺少订阅ID')
  }

  const existing = db
    .select()
    .from(sysSubscription)
    .where(eq(sysSubscription.id, id))
    .get()

  if (!existing) {
    return fail('订阅不存在')
  }

  const updates: Record<string, unknown> = {}
  if (name !== undefined) updates.name = name
  if (remark !== undefined) updates.remark = remark
  if (status !== undefined) updates.status = status

  if (Object.keys(updates).length > 0) {
    db.update(sysSubscription)
      .set(updates)
      .where(eq(sysSubscription.id, id))
      .run()
  }

  if (nodeIds !== undefined && Array.isArray(nodeIds)) {
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
