import { request } from '@/lib/request'
import type { DashboardOverview } from '@/types'

export function getDashboardOverview(days = 7): Promise<DashboardOverview> {
  return request('/api/dashboard/overview', {
    method: 'POST',
    body: JSON.stringify({ days }),
  })
}
