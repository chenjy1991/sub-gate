import { NextRequest } from 'next/server'
import { requireRequestAuth } from '@/lib/api/auth'
import { createEntityIdSchema } from '@/lib/api/schemas'
import { parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { sysSubscription, sysSubscriptionNode, sysSubscriptionRole, sysSubscriptionUser, sysNode, sysRole, sysUser } from '@/lib/db/schema'
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

  const nodeRows = db
    .select({
      nodeId: sysSubscriptionNode.nodeId,
      node: sysNode,
    })
    .from(sysSubscriptionNode)
    .innerJoin(sysNode, eq(sysSubscriptionNode.nodeId, sysNode.id))
    .where(eq(sysSubscriptionNode.subscriptionId, id))
    .all()

  const roleRows = db
    .select({
      roleId: sysSubscriptionRole.roleId,
      role: sysRole,
    })
    .from(sysSubscriptionRole)
    .innerJoin(sysRole, eq(sysSubscriptionRole.roleId, sysRole.id))
    .where(eq(sysSubscriptionRole.subscriptionId, id))
    .all()

  const userRows = db
    .select({
      userId: sysSubscriptionUser.userId,
      user: {
        id: sysUser.id,
        username: sysUser.username,
        nickname: sysUser.nickname,
        status: sysUser.status,
        createdAt: sysUser.createdAt,
      },
    })
    .from(sysSubscriptionUser)
    .innerJoin(sysUser, eq(sysSubscriptionUser.userId, sysUser.id))
    .where(eq(sysSubscriptionUser.subscriptionId, id))
    .all()

  const nodeIds = nodeRows.map(row => row.nodeId)
  const nodes = nodeRows.map(row => row.node)
  const roleIds = roleRows.map(row => row.roleId)
  const roles = roleRows.map(row => row.role)
  const userIds = userRows.map(row => row.userId)
  const users = userRows.map(row => row.user)

  return ok({
    id: subscription.id,
    name: subscription.name,
    remark: subscription.remark,
    status: subscription.status,
    nodes,
    nodeIds,
    roleIds,
    userIds,
    roles,
    users,
  })
}
