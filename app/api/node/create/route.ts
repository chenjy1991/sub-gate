import { NextRequest } from 'next/server'
import { requireRequestAuth } from '@/lib/api/auth'
import { nodePayloadSchema } from '@/lib/api/schemas'
import { parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { sysNode } from '@/lib/db/schema'
import { ok } from '@/lib/result'

export async function POST(req: NextRequest) {
  const guard = await requireRequestAuth('node:create')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(req, nodePayloadSchema)
  if (!parsed.success) {
    return parsed.response
  }

  db.insert(sysNode).values(parsed.data).run()

  return ok()
}
