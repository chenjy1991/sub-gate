import { NextRequest } from 'next/server'
import { requireRequestAuth } from '@/lib/api/auth'
import { createEntityIdSchema } from '@/lib/api/schemas'
import { parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { getCurrentDateTime } from '@/lib/datetime'
import { sysNode, sysNodeCheckLog } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'
import { eq } from 'drizzle-orm'
import net from 'net'

function checkNode(address: string, port: number): Promise<{ reachable: boolean; latency: number }> {
  return new Promise(resolve => {
    const start = Date.now()
    const socket = new net.Socket()
    socket.setTimeout(5000)
    socket.on('connect', () => {
      const latency = Date.now() - start
      socket.destroy()
      resolve({ reachable: true, latency })
    })
    socket.on('timeout', () => {
      socket.destroy()
      resolve({ reachable: false, latency: -1 })
    })
    socket.on('error', () => {
      socket.destroy()
      resolve({ reachable: false, latency: -1 })
    })
    socket.connect(port, address)
  })
}

export async function POST(req: NextRequest) {
  const guard = await requireRequestAuth('node:check')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(req, createEntityIdSchema('节点ID'))
  if (!parsed.success) {
    return parsed.response
  }

  const { id } = parsed.data

  const node = db
    .select()
    .from(sysNode)
    .where(eq(sysNode.id, id))
    .get()

  if (!node) return fail('节点不存在')

  const result = await checkNode(node.address, node.port)

  const checkedAt = getCurrentDateTime()

  try {
    db.insert(sysNodeCheckLog).values({
      nodeId: node.id,
      isReachable: result.reachable ? 1 : 0,
      latency: result.latency,
      createdAt: checkedAt,
    }).run()

    db.update(sysNode)
      .set({
        lastCheckedAt: checkedAt,
        lastCheckStatus: result.reachable ? 1 : 0,
        lastCheckLatency: result.latency,
        updatedAt: checkedAt,
      })
      .where(eq(sysNode.id, node.id))
      .run()
  } catch (error) {
    console.error('记录节点检测历史失败', error)
  }

  return ok(result)
}
