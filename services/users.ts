import { request } from '@/lib/request'
import type { EntityId, PageResult, User } from '@/types'

export function getUsers(params: { page: number; size: number; username?: string }): Promise<PageResult<User>> {
  return request('/api/user/list', { method: 'POST', body: JSON.stringify(params) })
}

export function getUserById(id: EntityId): Promise<User> {
  return request('/api/user/getById', { method: 'POST', body: JSON.stringify({ id }) })
}

export function getMe(): Promise<User> {
  return request('/api/user/me', { method: 'POST', body: JSON.stringify({}) })
}

export function createUser(data: { username: string; email: string; password: string; nickname?: string; status?: number; roleIds?: EntityId[] }): Promise<void> {
  return request('/api/user/create', { method: 'POST', body: JSON.stringify(data) })
}

export function updateUser(data: { id: EntityId; username?: string; email?: string; password?: string; nickname?: string; status?: number; roleIds?: EntityId[] }): Promise<void> {
  return request('/api/user/update', { method: 'POST', body: JSON.stringify(data) })
}

export function deleteUser(id: EntityId): Promise<void> {
  return request('/api/user/delete', { method: 'POST', body: JSON.stringify({ id }) })
}

export function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  return request('/api/user/change-password', { method: 'POST', body: JSON.stringify({ oldPassword, newPassword }) })
}
