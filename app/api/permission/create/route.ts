import { NextRequest } from 'next/server'
import { requireRequestAuth } from '@/lib/api/auth'
import { permissionPayloadSchema } from '@/lib/api/schemas'
import { parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { sysPermission } from '@/lib/db/schema'
import { ok } from '@/lib/result'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth('permission:create')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, permissionPayloadSchema)
  if (!parsed.success) {
    return parsed.response
  }

  const { parentId, name, code, type, sort, remark } = parsed.data

  const result = db.insert(sysPermission).values({
    parentId,
    name,
    code,
    type,
    sort,
    remark: remark || null,
  }).run()

  const permission = db.select().from(sysPermission).where(eq(sysPermission.id, Number(result.lastInsertRowid))).get()

  return ok(permission)
}
