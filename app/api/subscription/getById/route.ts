import { NextRequest } from 'next/server'
import { requireRequestAuth } from '@/lib/api/auth'
import { createEntityIdSchema } from '@/lib/api/schemas'
import { parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { sysSubscription, sysSubscriptionNode, sysSubscriptionRole, sysSubscriptionUser } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth('subscription:list')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, createEntityIdSchema('订阅ID'))
  if (!parsed.success) {
    return parsed.response
  }

  const { id } = parsed.data

  const subscription = db
    .select()
    .from(sysSubscription)
    .where(eq(sysSubscription.id, id))
    .get()

  if (!subscription) {
    return fail('订阅不存在')
  }

  const nodeIds = db
    .select({ nodeId: sysSubscriptionNode.nodeId })
    .from(sysSubscriptionNode)
    .where(eq(sysSubscriptionNode.subscriptionId, id))
    .all()
    .map(row => row.nodeId)

  const roleIds = db
    .select({ roleId: sysSubscriptionRole.roleId })
    .from(sysSubscriptionRole)
    .where(eq(sysSubscriptionRole.subscriptionId, id))
    .all()
    .map(row => row.roleId)

  const userIds = db
    .select({ userId: sysSubscriptionUser.userId })
    .from(sysSubscriptionUser)
    .where(eq(sysSubscriptionUser.subscriptionId, id))
    .all()
    .map(row => row.userId)

  return ok({ ...subscription, nodeIds, roleIds, userIds })
}
