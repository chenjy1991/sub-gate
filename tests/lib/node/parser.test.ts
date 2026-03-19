import test from 'node:test'
import assert from 'node:assert/strict'
import { parseLinks } from '@/lib/node/parser'

test('parseLinks 可以解析 vmess 链接', () => {
  const vmessPayload = Buffer.from(JSON.stringify({
    v: '2',
    ps: 'demo-vmess',
    add: 'example.com',
    port: '443',
    id: '123e4567-e89b-12d3-a456-426614174000',
    aid: '0',
    net: 'ws',
    scy: 'auto',
    host: 'cdn.example.com',
    path: '/ws',
    tls: 'tls',
    sni: 'example.com',
  }), 'utf-8').toString('base64')

  const result = parseLinks(`vmess://${vmessPayload}`)

  assert.equal(result.failed.length, 0)
  assert.equal(result.success.length, 1)
  assert.deepEqual(result.success[0], {
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
    rawLink: `vmess://${vmessPayload}`,
    remark: null,
    status: 1,
    sort: 0,
  })
})

test('parseLinks 会记录不支持协议的失败项', () => {
  const result = parseLinks('ftp://example.com')

  assert.equal(result.success.length, 0)
  assert.equal(result.failed.length, 1)
  assert.match(result.failed[0].error, /不支持的协议/)
})
