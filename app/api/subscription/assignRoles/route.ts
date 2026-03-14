import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sysSubscriptionRole } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { id, roleIds } = body

  if (!id) {
    return fail('缺少订阅ID')
  }

  db.delete(sysSubscriptionRole)
    .where(eq(sysSubscriptionRole.subscriptionId, id))
    .run()

  if (roleIds && Array.isArray(roleIds) && roleIds.length > 0) {
    db.insert(sysSubscriptionRole)
      .values(roleIds.map((roleId: number) => ({ subscriptionId: id, roleId })))
      .run()
  }

  return ok()
}
