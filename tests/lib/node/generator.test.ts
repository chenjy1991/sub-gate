import test from 'node:test'
import assert from 'node:assert/strict'
import { generateLink } from '@/lib/node/generator'
import type { NodeData } from '@/lib/node/parser'

const baseNode: NodeData = {
  name: 'demo-node',
  address: 'example.com',
  port: 443,
  protocol: 'vless',
  uuid: '123e4567-e89b-12d3-a456-426614174000',
  alterId: 0,
  security: 'none',
  network: 'ws',
  tls: 1,
  sni: 'example.com',
  path: '/ws',
  host: 'cdn.example.com',
  rawLink: null,
  remark: null,
  status: 1,
  sort: 0,
}

test('generateLink 可以生成 vless 链接', () => {
  const link = generateLink(baseNode)

  assert.match(link, /^vless:\/\//)
  assert.match(link, /example\.com:443/)
  assert.match(link, /type=ws/)
  assert.match(link, /security=tls/)
  assert.match(link, /#demo-node$/)
})

test('generateLink 对不支持协议返回空字符串', () => {
  const link = generateLink({ ...baseNode, protocol: 'unknown' })

  assert.equal(link, '')
})
