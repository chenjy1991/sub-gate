import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sysNode } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'
import { eq } from 'drizzle-orm'
import { generateLink } from '@/lib/node/generator'

export async function POST(req: NextRequest) {
  const { id } = await req.json()

  const node = await db
    .select()
    .from(sysNode)
    .where(eq(sysNode.id, id))
    .then(r => r[0])

  if (!node) return fail('节点不存在')

  const link = generateLink(node)

  if (!link) return fail('不支持的协议类型')

  return ok(link)
}
