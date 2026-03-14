import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sysSubscription, sysSubscriptionNode, sysSubscriptionRole, sysSubscriptionUser } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'
import { eq } from 'drizzle-orm'

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

  const roleIds = db
    .select({ roleId: sysSubscriptionRole.roleId })
    .from(sysSubscriptionRole)
    .where(eq(sysSubscriptionRole.subscriptionId, id))
    .all()
    .map(r => r.roleId)

  const userIds = db
    .select({ userId: sysSubscriptionUser.userId })
    .from(sysSubscriptionUser)
    .where(eq(sysSubscriptionUser.subscriptionId, id))
    .all()
    .map(r => r.userId)

  return ok({ ...subscription, nodeIds, roleIds, userIds })
}
