import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sysSubscription, sysSubscriptionNode, sysSubscriptionRole, sysSubscriptionUser, sysUserRole, sysNode } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'
import { getAuthFromCookie } from '@/lib/auth'
import { eq, inArray, and } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const auth = await getAuthFromCookie()
  if (!auth) {
    return fail('未登录或登录已过期')
  }

  const body = await request.json()
  const { id } = body

  if (!id) {
    return fail('缺少订阅ID')
  }

  const userId = auth.userId

  // Check direct user assignment
  const directAccess = db
    .select()
    .from(sysSubscriptionUser)
    .where(eq(sysSubscriptionUser.subscriptionId, id))
    .all()
    .some(r => r.userId === userId)

  let roleAccess = false
  if (!directAccess) {
    const userRoleIds = db
      .select({ roleId: sysUserRole.roleId })
      .from(sysUserRole)
      .where(eq(sysUserRole.userId, userId))
      .all()
      .map(r => r.roleId)

    if (userRoleIds.length > 0) {
      roleAccess = db
        .select()
        .from(sysSubscriptionRole)
        .where(eq(sysSubscriptionRole.subscriptionId, id))
        .all()
        .some(r => userRoleIds.includes(r.roleId))
    }
  }

  if (!directAccess && !roleAccess) {
    return fail('无权访问该订阅')
  }

  const subscription = db
    .select()
    .from(sysSubscription)
    .where(eq(sysSubscription.id, id))
    .get()

  if (!subscription || subscription.status === 0) {
    return fail('订阅不存在或已禁用')
  }

  const nodeIds = db
    .select({ nodeId: sysSubscriptionNode.nodeId })
    .from(sysSubscriptionNode)
    .where(eq(sysSubscriptionNode.subscriptionId, id))
    .all()
    .map(r => r.nodeId)

  const nodes = nodeIds.length > 0
    ? db.select().from(sysNode).where(and(inArray(sysNode.id, nodeIds), eq(sysNode.status, 1))).all()
    : []

  return ok({
    id: subscription.id,
    name: subscription.name,
    remark: subscription.remark,
    nodes,
  })
}
