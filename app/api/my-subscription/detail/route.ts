import { NextRequest } from 'next/server'
import { requireRequestAuth } from '@/lib/api/auth'
import { createEntityIdSchema } from '@/lib/api/schemas'
import { parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { sysSubscription, sysSubscriptionNode, sysSubscriptionRole, sysSubscriptionUser, sysUserRole, sysNode } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'
import { eq, inArray, and } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth()
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, createEntityIdSchema('订阅ID'))
  if (!parsed.success) {
    return parsed.response
  }

  const auth = guard.auth
  const { id } = parsed.data
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
