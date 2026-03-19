import { request } from '@/lib/request'
import type { EntityId, MySubscription, MySubscriptionDetail } from '@/types'

export function getMySubscriptions(): Promise<MySubscription[]> {
  return request('/api/my-subscription/list', { method: 'POST', body: JSON.stringify({}) })
}

export function getMySubscriptionDetail(id: EntityId): Promise<MySubscriptionDetail> {
  return request('/api/my-subscription/detail', { method: 'POST', body: JSON.stringify({ id }) })
}
