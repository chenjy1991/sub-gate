import type { NodeData } from './parser'

function hasText(s: string | null | undefined): s is string {
  return s != null && s.trim().length > 0
}

function encodeParam(s: string | null | undefined): string {
  if (!s) return ''
  return encodeURIComponent(s)
}

function generateVmess(node: NodeData): string {
  const json = {
    v: '2',
    ps: node.name ?? '',
    add: node.address,
    port: node.port,
    id: node.uuid ?? '',
    aid: node.alterId ?? 0,
    net: node.network ?? 'tcp',
    scy: node.security ?? 'auto',
    host: node.host ?? '',
    path: node.path ?? '',
    tls: node.tls === 1 ? 'tls' : '',
    sni: node.sni ?? '',
  }
  return 'vmess://' + Buffer.from(JSON.stringify(json), 'utf-8').toString('base64')
}

function generateVless(node: NodeData): string {
  let s = `vless://${node.uuid ?? ''}@${node.address}:${node.port}`
  s += `?encryption=${node.security ?? 'none'}`
  s += `&type=${node.network ?? 'tcp'}`
  if (node.tls === 1) {
    s += '&security=tls'
    if (hasText(node.sni)) s += `&sni=${encodeParam(node.sni)}`
  }
  if (hasText(node.host)) s += `&host=${encodeParam(node.host)}`
  if (hasText(node.path)) s += `&path=${encodeParam(node.path)}`
  if (hasText(node.name)) s += `#${encodeParam(node.name)}`
  return s
}

function generateTrojan(node: NodeData): string {
  let s = `trojan://${node.uuid ?? ''}@${node.address}:${node.port}`
  s += `?type=${node.network ?? 'tcp'}`
  if (node.tls === 1) {
    s += '&security=tls'
    if (hasText(node.sni)) s += `&sni=${encodeParam(node.sni)}`
  }
  if (hasText(node.host)) s += `&host=${encodeParam(node.host)}`
  if (hasText(node.path)) s += `&path=${encodeParam(node.path)}`
  if (hasText(node.name)) s += `#${encodeParam(node.name)}`
  return s
}

function generateShadowsocks(node: NodeData): string {
  const method = node.security ?? 'aes-256-gcm'
  const password = node.uuid ?? ''
  const userInfo = Buffer.from(`${method}:${password}`, 'utf-8')
    .toString('base64url')
  let s = `ss://${userInfo}@${node.address}:${node.port}`
  if (hasText(node.name)) s += `#${encodeParam(node.name)}`
  return s
}

function generateHysteria2(node: NodeData): string {
  let s = `hysteria2://${node.uuid ?? ''}@${node.address}:${node.port}`
  if (hasText(node.sni)) s += `?sni=${encodeParam(node.sni)}`
  if (hasText(node.name)) s += `#${encodeParam(node.name)}`
  return s
}

export function generateLink(node: NodeData): string {
  switch (node.protocol) {
    case 'vmess': return generateVmess(node)
    case 'vless': return generateVless(node)
    case 'trojan': return generateTrojan(node)
    case 'ss': return generateShadowsocks(node)
    case 'hysteria2': return generateHysteria2(node)
    default: return ''
  }
}
