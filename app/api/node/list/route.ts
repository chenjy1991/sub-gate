import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireRequestAuth } from '@/lib/api/auth'
import { paginationSchema } from '@/lib/api/schemas'
import { parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { sysNode } from '@/lib/db/schema'
import { ok } from '@/lib/result'
import { like, or, sql, desc } from 'drizzle-orm'

const nodeListSchema = paginationSchema.extend({
  keyword: z.string().trim().optional(),
})

export async function POST(req: NextRequest) {
  const guard = await requireRequestAuth('node:list')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(req, nodeListSchema)
  if (!parsed.success) {
    return parsed.response
  }

  const { page, size, keyword } = parsed.data

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
