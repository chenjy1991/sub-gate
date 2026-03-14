import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sysPermission } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { id, ...fields } = body

  if (!id) {
    return fail('权限ID不能为空')
  }

  db.update(sysPermission).set(fields).where(eq(sysPermission.id, id)).run()

  return ok()
}
