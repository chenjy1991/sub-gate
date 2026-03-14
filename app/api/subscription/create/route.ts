import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sysSubscription, sysSubscriptionNode } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, remark, status, nodeIds } = body

  if (!name || !name.trim()) {
    return fail('订阅名称不能为空')
  }

  const result = db.insert(sysSubscription).values({
    name: name.trim(),
    remark: remark ?? null,
    status: status ?? 1,
  }).run()

  const subId = Number(result.lastInsertRowid)

  if (nodeIds && Array.isArray(nodeIds) && nodeIds.length > 0) {
    db.insert(sysSubscriptionNode)
      .values(nodeIds.map((nodeId: number) => ({ subscriptionId: subId, nodeId })))
      .run()
  }

  return ok()
}
