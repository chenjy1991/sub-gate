import { NextRequest } from 'next/server'
import { requireRequestAuth } from '@/lib/api/auth'
import { createEntityIdSchema } from '@/lib/api/schemas'
import { parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { sysNode } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const guard = await requireRequestAuth('node:list')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(req, createEntityIdSchema('节点ID'))
  if (!parsed.success) {
    return parsed.response
  }

  const { id } = parsed.data

  const node = db
    .select()
    .from(sysNode)
    .where(eq(sysNode.id, id))
    .get()

  if (!node) return fail('节点不存在')

  return ok(node)
}
