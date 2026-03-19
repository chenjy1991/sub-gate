import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireRequestAuth } from '@/lib/api/auth'
import { createIdArraySchema } from '@/lib/api/schemas'
import { createIdSchema, parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { sysSubscriptionUser } from '@/lib/db/schema'
import { ok } from '@/lib/result'
import { eq } from 'drizzle-orm'

const assignUsersSchema = z.object({
  id: createIdSchema('订阅ID'),
  userIds: createIdArraySchema('用户ID').optional().default([]),
})

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth('subscription:assignUsers')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, assignUsersSchema)
  if (!parsed.success) {
    return parsed.response
  }

  const { id, userIds } = parsed.data

  db.delete(sysSubscriptionUser)
    .where(eq(sysSubscriptionUser.subscriptionId, id))
    .run()

  if (userIds.length > 0) {
    db.insert(sysSubscriptionUser)
      .values(userIds.map((userId: number) => ({ subscriptionId: id, userId })))
      .run()
  }

  return ok()
}
