import { requireRequestAuth } from '@/lib/api/auth'
import { db } from '@/lib/db'
import { sysSubscription, sysSubscriptionNode, sysSubscriptionRole, sysSubscriptionUser, sysUserRole, sysNode } from '@/lib/db/schema'
import { ok } from '@/lib/result'
import { eq, inArray, sql, and } from 'drizzle-orm'

export async function POST() {
  const guard = await requireRequestAuth()
  if (guard.response) {
    return guard.response
  }

  const auth = guard.auth
  const userId = auth.userId

  const userRoleIds = db
    .select({ roleId: sysUserRole.roleId })
    .from(sysUserRole)
    .where(eq(sysUserRole.userId, userId))
    .all()
    .map(r => r.roleId)

  const directSubIds = db
    .select({ subscriptionId: sysSubscriptionUser.subscriptionId })
    .from(sysSubscriptionUser)
    .where(eq(sysSubscriptionUser.userId, userId))
    .all()
    .map(r => r.subscriptionId)

  const roleSubIds = userRoleIds.length > 0
    ? db
        .select({ subscriptionId: sysSubscriptionRole.subscriptionId })
        .from(sysSubscriptionRole)
        .where(inArray(sysSubscriptionRole.roleId, userRoleIds))
        .all()
        .map(r => r.subscriptionId)
    : []

  const allSubIds = [...new Set([...directSubIds, ...roleSubIds])]

  if (allSubIds.length === 0) {
    return ok([])
  }

  const subscriptions = db
    .select()
    .from(sysSubscription)
    .where(inArray(sysSubscription.id, allSubIds))
    .all()
    .filter(s => s.status === 1)

  const subscriptionIds = subscriptions.map(subscription => subscription.id)
  const nodeCounts = subscriptionIds.length > 0
    ? db
      .select({
        subscriptionId: sysSubscriptionNode.subscriptionId,
        count: sql<number>`count(*)`,
      })
      .from(sysSubscriptionNode)
      .innerJoin(sysNode, eq(sysSubscriptionNode.nodeId, sysNode.id))
      .where(and(inArray(sysSubscriptionNode.subscriptionId, subscriptionIds), eq(sysNode.status, 1)))
      .groupBy(sysSubscriptionNode.subscriptionId)
      .all()
    : []

  const nodeCountBySubscriptionId = new Map<number, number>()
  for (const row of nodeCounts) {
    nodeCountBySubscriptionId.set(row.subscriptionId, row.count)
  }

  const list = subscriptions.map(sub => ({
    id: sub.id,
    name: sub.name,
    remark: sub.remark,
    status: sub.status,
    nodeCount: nodeCountBySubscriptionId.get(sub.id) ?? 0,
  }))

  return ok(list)
}
