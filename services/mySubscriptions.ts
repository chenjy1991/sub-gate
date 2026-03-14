import { request } from '@/lib/request'
import type { MySubscription, MySubscriptionDetail } from '@/types'

export function getMySubscriptions(): Promise<MySubscription[]> {
  return request('/api/my-subscription/list', { method: 'POST', body: JSON.stringify({}) })
}

export function getMySubscriptionDetail(id: string): Promise<MySubscriptionDetail> {
  return request('/api/my-subscription/detail', { method: 'POST', body: JSON.stringify({ id }) })
}
