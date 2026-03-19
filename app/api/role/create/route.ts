import { NextRequest } from 'next/server'
import { requireRequestAuth } from '@/lib/api/auth'
import { rolePayloadSchema } from '@/lib/api/schemas'
import { parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { ok } from '@/lib/result'
import { sysRole } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth('role:create')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, rolePayloadSchema)
  if (!parsed.success) {
    return parsed.response
  }

  const { name, code, remark, status } = parsed.data

  const result = db.insert(sysRole).values({
    name,
    code,
    remark: remark || null,
    status,
  }).run()

  const role = db.select().from(sysRole).where(eq(sysRole.id, Number(result.lastInsertRowid))).get()

  return ok(role)
}
