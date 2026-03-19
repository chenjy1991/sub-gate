import { NextRequest } from 'next/server'
import { requireRequestAuth } from '@/lib/api/auth'
import { createEntityIdSchema } from '@/lib/api/schemas'
import { parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { sysNode } from '@/lib/db/schema'
import { ok } from '@/lib/result'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const guard = await requireRequestAuth('node:delete')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(req, createEntityIdSchema('节点ID'))
  if (!parsed.success) {
    return parsed.response
  }

  const { id } = parsed.data

  db.delete(sysNode).where(eq(sysNode.id, id)).run()

  return ok()
}
