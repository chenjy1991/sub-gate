import { NextRequest } from 'next/server'
import { requireRequestAuth } from '@/lib/api/auth'
import { paginationSchema } from '@/lib/api/schemas'
import { parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { sysPermission } from '@/lib/db/schema'
import { ok } from '@/lib/result'
import { sql } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth('permission:list')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, paginationSchema)
  if (!parsed.success) {
    return parsed.response
  }

  const { page, size } = parsed.data

  const [{ total }] = db.select({ total: sql<number>`count(*)` }).from(sysPermission).all()

  const list = db.select().from(sysPermission)
    .limit(size)
    .offset((page - 1) * size)
    .all()

  return ok({ total, list })
}
