import { request } from '@/lib/request'
import type { Role, PageResult } from '@/types'

export function getRoles(params: { page: number; size: number }): Promise<PageResult<Role>> {
  return request('/api/role/list', { method: 'POST', body: JSON.stringify(params) })
}

export function createRole(data: Omit<Role, 'id'>): Promise<Role> {
  return request('/api/role/create', { method: 'POST', body: JSON.stringify(data) })
}

export function updateRole(data: Role): Promise<void> {
  return request('/api/role/update', { method: 'POST', body: JSON.stringify(data) })
}

export function deleteRole(id: string): Promise<void> {
  return request('/api/role/delete', { method: 'POST', body: JSON.stringify({ id }) })
}

export function getPermissionIds(roleId: string): Promise<string[]> {
  return request('/api/role/getPermissionIds', { method: 'POST', body: JSON.stringify({ roleId }) })
}

export function assignPermissions(roleId: string, permissionIds: string[]): Promise<void> {
  return request('/api/role/assignPermissions', { method: 'POST', body: JSON.stringify({ roleId, permissionIds }) })
}
