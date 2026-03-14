import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sysNode } from '@/lib/db/schema'
import { ok } from '@/lib/result'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const { id } = await req.json()

  await db.delete(sysNode).where(eq(sysNode.id, id))

  return ok()
}
