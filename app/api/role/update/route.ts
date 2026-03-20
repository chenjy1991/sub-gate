import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireRequestAuth } from '@/lib/api/auth'
import { createIdSchema, normalizeOptionalText, parseJsonBody, statusSchema } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { getCurrentDateTime } from '@/lib/datetime'
import { ok } from '@/lib/result'
import { sysRole } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const updateRoleSchema = z.object({
  id: createIdSchema('角色ID'),
  name: z.string().trim().min(1, '角色名称不能为空').optional(),
  code: z.string().trim().min(1, '角色编码不能为空').optional(),
  remark: z.string().trim().max(255, '备注长度不能超过255').optional().nullable(),
  status: statusSchema.optional(),
})

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth('role:update')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, updateRoleSchema)
  if (!parsed.success) {
    return parsed.response
  }

  const { id, name, code, remark, status } = parsed.data

  const updates: Record<string, unknown> = {}
  if (name !== undefined && name !== null) updates.name = name
  if (code !== undefined && code !== null) updates.code = code
  if (remark !== undefined) updates.remark = normalizeOptionalText(remark) ?? null
  if (status !== undefined && status !== null) updates.status = status

  if (Object.keys(updates).length > 0) {
    updates.updatedAt = getCurrentDateTime()
    db.update(sysRole).set(updates).where(eq(sysRole.id, id)).run()
  }

  return ok()
}
