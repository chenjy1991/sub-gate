import test from 'node:test'
import assert from 'node:assert/strict'
import { generateBase64, generateClash } from '@/lib/node/subscription'
import type { NodeData } from '@/lib/node/parser'

const nodes: NodeData[] = [
  {
    name: 'demo-vmess',
    address: 'example.com',
    port: 443,
    protocol: 'vmess',
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    alterId: 0,
    security: 'auto',
    network: 'ws',
    tls: 1,
    sni: 'example.com',
    path: '/ws',
    host: 'cdn.example.com',
    rawLink: null,
    remark: null,
    status: 1,
    sort: 0,
  },
]

test('generateBase64 会输出可解码的订阅内容', () => {
  const encoded = generateBase64(nodes)
  const decoded = Buffer.from(encoded, 'base64').toString('utf-8')

  assert.match(decoded, /^vmess:\/\//)
})

test('generateClash 会包含代理节点和策略组', () => {
  const clash = generateClash(nodes, 'demo')

  assert.match(clash, /proxies:/)
  assert.match(clash, /proxy-groups:/)
  assert.match(clash, /demo-vmess/)
})
