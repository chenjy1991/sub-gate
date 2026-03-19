import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireRequestAuth } from '@/lib/api/auth'
import { nodePayloadSchema } from '@/lib/api/schemas'
import { parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { sysNode } from '@/lib/db/schema'
import { ok } from '@/lib/result'

const importNodesSchema = z.object({
  nodes: z.array(nodePayloadSchema).min(1, '节点列表不能为空'),
})

export async function POST(req: NextRequest) {
  const guard = await requireRequestAuth('node:import')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(req, importNodesSchema)
  if (!parsed.success) {
    return parsed.response
  }

  db.insert(sysNode).values(parsed.data.nodes).run()

  return ok()
}
