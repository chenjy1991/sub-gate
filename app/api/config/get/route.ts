import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireRequestAuth } from '@/lib/api/auth'
import { getJsonConfig } from '@/lib/config'
import { parseJsonBody } from '@/lib/api/validation'
import { ok } from '@/lib/result'

const getConfigSchema = z.object({
  key: z.enum(['mail', 'site']),
})

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth('mail:list')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, getConfigSchema)
  if (!parsed.success) {
    return parsed.response
  }

  return ok(getJsonConfig(parsed.data.key))
}
