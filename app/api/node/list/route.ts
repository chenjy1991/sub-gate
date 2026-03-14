import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sysNode } from '@/lib/db/schema'
import { ok } from '@/lib/result'
import { like, or, sql, desc } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const { page = 1, size = 10, keyword } = await req.json()

  const where = keyword
    ? or(like(sysNode.name, `%${keyword}%`), like(sysNode.address, `%${keyword}%`))
    : undefined

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(sysNode)
    .where(where)
    .then(r => r[0].count)

  const list = await db
    .select()
    .from(sysNode)
    .where(where)
    .orderBy(desc(sysNode.id))
    .limit(size)
    .offset((page - 1) * size)

  return ok({ total, list })
}
