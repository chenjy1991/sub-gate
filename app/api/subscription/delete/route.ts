import { NextRequest } from 'next/server'
import { requireRequestAuth } from '@/lib/api/auth'
import { createEntityIdSchema } from '@/lib/api/schemas'
import { parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { sysSubscription } from '@/lib/db/schema'
import { ok } from '@/lib/result'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth('subscription:delete')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, createEntityIdSchema('订阅ID'))
  if (!parsed.success) {
    return parsed.response
  }

  const { id } = parsed.data

  db.delete(sysSubscription)
    .where(eq(sysSubscription.id, id))
    .run()

  return ok()
}
