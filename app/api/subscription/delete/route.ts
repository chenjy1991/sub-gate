import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sysSubscription } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { id } = body

  if (!id) {
    return fail('缺少订阅ID')
  }

  db.delete(sysSubscription)
    .where(eq(sysSubscription.id, id))
    .run()

  return ok()
}
