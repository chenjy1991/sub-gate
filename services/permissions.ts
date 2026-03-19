import { request } from '@/lib/request'
import type { EntityId, Permission, PermissionTreeNode } from '@/types'

export function getPermissionTree(): Promise<PermissionTreeNode[]> {
  return request('/api/permission/tree', { method: 'POST', body: JSON.stringify({}) })
}

export function createPermission(data: Omit<Permission, 'id'>): Promise<void> {
  return request('/api/permission/create', { method: 'POST', body: JSON.stringify(data) })
}

export function updatePermission(data: Permission): Promise<void> {
  return request('/api/permission/update', { method: 'POST', body: JSON.stringify(data) })
}

export function deletePermission(id: EntityId): Promise<void> {
  return request('/api/permission/delete', { method: 'POST', body: JSON.stringify({ id }) })
}
