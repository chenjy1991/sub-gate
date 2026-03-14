import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sysSubscriptionUser } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { id, userIds } = body

  if (!id) {
    return fail('缺少订阅ID')
  }

  db.delete(sysSubscriptionUser)
    .where(eq(sysSubscriptionUser.subscriptionId, id))
    .run()

  if (userIds && Array.isArray(userIds) && userIds.length > 0) {
    db.insert(sysSubscriptionUser)
      .values(userIds.map((userId: number) => ({ subscriptionId: id, userId })))
      .run()
  }

  return ok()
}
