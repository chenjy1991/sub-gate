import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sysNode } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const { id, ...fields } = await req.json()

  if (!id) return fail('id不能为空')

  await db.update(sysNode).set(fields).where(eq(sysNode.id, id))

  return ok()
}
