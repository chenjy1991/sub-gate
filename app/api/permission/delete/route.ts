import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sysPermission } from '@/lib/db/schema'
import { ok } from '@/lib/result'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { id } = body

  db.delete(sysPermission).where(eq(sysPermission.id, id)).run()

  return ok()
}
