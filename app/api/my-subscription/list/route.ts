import { db } from '@/lib/db'
import { sysSubscription, sysSubscriptionNode, sysSubscriptionRole, sysSubscriptionUser, sysUserRole } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'
import { getAuthFromCookie } from '@/lib/auth'
import { eq, inArray, sql } from 'drizzle-orm'

export async function POST() {
  const auth = await getAuthFromCookie()
  if (!auth) {
    return fail('未登录或登录已过期')
  }

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

  const list = subscriptions.map(sub => {
    const [{ count }] = db
      .select({ count: sql<number>`count(*)` })
      .from(sysSubscriptionNode)
      .where(eq(sysSubscriptionNode.subscriptionId, sub.id))
      .all()

    return {
      id: sub.id,
      name: sub.name,
      remark: sub.remark,
      status: sub.status,
      nodeCount: count,
    }
  })

  return ok(list)
}
