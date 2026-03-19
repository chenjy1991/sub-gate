import { request } from '@/lib/request'
import type { EntityId, PageResult, Subscription, SubscriptionDetail } from '@/types'

export function getSubscriptions(params: { page: number; size: number }): Promise<PageResult<Subscription>> {
  return request('/api/subscription/list', { method: 'POST', body: JSON.stringify(params) })
}

export function getSubscriptionById(id: EntityId): Promise<SubscriptionDetail> {
  return request('/api/subscription/getById', { method: 'POST', body: JSON.stringify({ id }) })
}

export function getSubscriptionDetail(id: EntityId): Promise<SubscriptionDetail> {
  return request('/api/subscription/detail', { method: 'POST', body: JSON.stringify({ id }) })
}

export function createSubscription(data: { name: string; remark?: string; status?: number; nodeIds?: EntityId[] }): Promise<void> {
  return request('/api/subscription/create', { method: 'POST', body: JSON.stringify(data) })
}

export function updateSubscription(data: { id: EntityId; name?: string; remark?: string; status?: number; nodeIds?: EntityId[] }): Promise<void> {
  return request('/api/subscription/update', { method: 'POST', body: JSON.stringify(data) })
}

export function deleteSubscription(id: EntityId): Promise<void> {
  return request('/api/subscription/delete', { method: 'POST', body: JSON.stringify({ id }) })
}

export function assignSubscriptionRoles(id: EntityId, roleIds: EntityId[]): Promise<void> {
  return request('/api/subscription/assignRoles', { method: 'POST', body: JSON.stringify({ id, roleIds }) })
}

export function assignSubscriptionUsers(id: EntityId, userIds: EntityId[]): Promise<void> {
  return request('/api/subscription/assignUsers', { method: 'POST', body: JSON.stringify({ id, userIds }) })
}
