import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok } from '@/lib/result'
import { sysRole } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { page = 1, size = 10 } = body

  const [{ total }] = db.select({ total: sql<number>`count(*)` }).from(sysRole).all()

  const list = db.select().from(sysRole)
    .limit(size)
    .offset((page - 1) * size)
    .all()

  return ok({ total, list })
}
