import { request } from '@/lib/request'
import type { ProxyNode, PageResult, ParseResult } from '@/types'

export function getNodes(params: { page: number; size: number; keyword?: string }): Promise<PageResult<ProxyNode>> {
  return request('/api/node/list', { method: 'POST', body: JSON.stringify(params) })
}

export function getNodeById(id: string): Promise<ProxyNode> {
  return request('/api/node/getById', { method: 'POST', body: JSON.stringify({ id }) })
}

export function createNode(data: Omit<ProxyNode, 'id'>): Promise<void> {
  return request('/api/node/create', { method: 'POST', body: JSON.stringify(data) })
}

export function updateNode(data: Partial<ProxyNode> & { id: string }): Promise<void> {
  return request('/api/node/update', { method: 'POST', body: JSON.stringify(data) })
}

export function deleteNode(id: string): Promise<void> {
  return request('/api/node/delete', { method: 'POST', body: JSON.stringify({ id }) })
}

export function parseLinks(links: string): Promise<ParseResult> {
  return request('/api/node/parse', { method: 'POST', body: JSON.stringify({ links }) })
}

export function importNodes(nodes: Omit<ProxyNode, 'id'>[]): Promise<void> {
  return request('/api/node/import', { method: 'POST', body: JSON.stringify({ nodes }) })
}

export function checkNode(id: string): Promise<{ reachable: boolean; latency: number }> {
  return request('/api/node/check', { method: 'POST', body: JSON.stringify({ id }) })
}

export function generateLink(id: string): Promise<string> {
  return request('/api/node/generateLink', { method: 'POST', body: JSON.stringify({ id }) })
}
