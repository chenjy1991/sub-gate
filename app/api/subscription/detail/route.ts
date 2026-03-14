import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sysSubscription, sysSubscriptionNode, sysSubscriptionRole, sysSubscriptionUser, sysNode, sysRole, sysUser } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'
import { eq, inArray } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { id } = body

  if (!id) {
    return fail('缺少订阅ID')
  }

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
    .map(r => r.nodeId)

  const nodes = nodeIds.length > 0
    ? db.select().from(sysNode).where(inArray(sysNode.id, nodeIds)).all()
    : []

  const roleIds = db
    .select({ roleId: sysSubscriptionRole.roleId })
    .from(sysSubscriptionRole)
    .where(eq(sysSubscriptionRole.subscriptionId, id))
    .all()
    .map(r => r.roleId)

  const roles = roleIds.length > 0
    ? db.select().from(sysRole).where(inArray(sysRole.id, roleIds)).all()
    : []

  const userIds = db
    .select({ userId: sysSubscriptionUser.userId })
    .from(sysSubscriptionUser)
    .where(eq(sysSubscriptionUser.subscriptionId, id))
    .all()
    .map(r => r.userId)

  const users = userIds.length > 0
    ? db.select({
        id: sysUser.id,
        username: sysUser.username,
        nickname: sysUser.nickname,
        status: sysUser.status,
        createdAt: sysUser.createdAt,
      }).from(sysUser).where(inArray(sysUser.id, userIds)).all()
    : []

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
