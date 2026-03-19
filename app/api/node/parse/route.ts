import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireRequestAuth } from '@/lib/api/auth'
import { parseJsonBody } from '@/lib/api/validation'
import { ok } from '@/lib/result'
import { parseLinks } from '@/lib/node/parser'

const parseLinksSchema = z.object({
  links: z.string().trim().min(1, '链接不能为空'),
})

export async function POST(req: NextRequest) {
  const guard = await requireRequestAuth('node:import')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(req, parseLinksSchema)
  if (!parsed.success) {
    return parsed.response
  }

  const result = parseLinks(parsed.data.links)

  return ok(result)
}
