import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sysNode } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'

export async function POST(req: NextRequest) {
  const { nodes } = await req.json()

  if (!nodes || !nodes.length) return fail('节点列表不能为空')

  await db.insert(sysNode).values(nodes)

  return ok()
}
