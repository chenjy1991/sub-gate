import { NextRequest } from 'next/server'
import { requireRequestAuth } from '@/lib/api/auth'
import { createEntityIdSchema } from '@/lib/api/schemas'
import { parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { sysPermission } from '@/lib/db/schema'
import { ok } from '@/lib/result'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth('permission:delete')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, createEntityIdSchema('权限ID'))
  if (!parsed.success) {
    return parsed.response
  }

  const { id } = parsed.data

  db.delete(sysPermission).where(eq(sysPermission.id, id)).run()

  return ok()
}
