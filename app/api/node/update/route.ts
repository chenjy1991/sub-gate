import { NextRequest } from 'next/server'
import { requireRequestAuth } from '@/lib/api/auth'
import { nodePayloadSchema } from '@/lib/api/schemas'
import { createIdSchema, parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { getCurrentDateTime } from '@/lib/datetime'
import { sysNode } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'
import { eq } from 'drizzle-orm'

const updateNodeSchema = nodePayloadSchema.partial().extend({
  id: createIdSchema('节点ID'),
})

export async function POST(req: NextRequest) {
  const guard = await requireRequestAuth('node:update')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(req, updateNodeSchema)
  if (!parsed.success) {
    return parsed.response
  }

  const { id, ...fields } = parsed.data

  if (Object.keys(fields).length === 0) {
    return fail('缺少可更新字段')
  }

  db.update(sysNode)
    .set({ ...fields, updatedAt: getCurrentDateTime() })
    .where(eq(sysNode.id, id))
    .run()

  return ok()
}
