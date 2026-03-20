import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireRequestAuth } from '@/lib/api/auth'
import { parseJsonBody } from '@/lib/api/validation'
import { getDashboardOverview } from '@/lib/dashboard'
import { ok } from '@/lib/result'

const dashboardOverviewSchema = z.object({
  days: z.coerce.number().int().min(7).max(30).optional().default(7),
})

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth('dashboard')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, dashboardOverviewSchema)
  if (!parsed.success) {
    return parsed.response
  }

  return ok(getDashboardOverview(parsed.data.days))
}
