import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sysNode } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const { id } = await req.json()

  const node = await db
    .select()
    .from(sysNode)
    .where(eq(sysNode.id, id))
    .then(r => r[0])

  if (!node) return fail('节点不存在')

  return ok(node)
}
