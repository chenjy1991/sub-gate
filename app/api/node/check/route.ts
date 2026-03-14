import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sysNode } from '@/lib/db/schema'
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
  const { id } = await req.json()

  const node = await db
    .select()
    .from(sysNode)
    .where(eq(sysNode.id, id))
    .then(r => r[0])

  if (!node) return fail('节点不存在')

  const result = await checkNode(node.address, node.port)

  return ok(result)
}
