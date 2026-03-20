import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireRequestAuth } from '@/lib/api/auth'
import { createIdSchema, normalizeOptionalText, parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { getCurrentDateTime } from '@/lib/datetime'
import { sysPermission } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'
import { eq } from 'drizzle-orm'

const updatePermissionSchema = z.object({
  id: createIdSchema('权限ID'),
  parentId: z.coerce.number().int('父级权限ID必须是整数').min(0, '父级权限ID不能小于0').optional(),
  name: z.string().trim().min(1, '权限名称不能为空').optional(),
  code: z.string().trim().min(1, '权限编码不能为空').optional(),
  type: z.enum(['menu', 'button']).optional(),
  sort: z.coerce.number().int('排序必须是整数').min(0, '排序不能小于0').optional(),
  remark: z.string().trim().max(255, '备注长度不能超过255').optional().nullable(),
})

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth('permission:update')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, updatePermissionSchema)
  if (!parsed.success) {
    return parsed.response
  }

  const { id, parentId, name, code, type, sort, remark } = parsed.data
  const fields: Record<string, unknown> = {}

  if (parentId !== undefined) fields.parentId = parentId
  if (name !== undefined) fields.name = name
  if (code !== undefined) fields.code = code
  if (type !== undefined) fields.type = type
  if (sort !== undefined) fields.sort = sort
  if (remark !== undefined) fields.remark = normalizeOptionalText(remark) ?? null

  if (Object.keys(fields).length === 0) {
    return fail('缺少可更新字段')
  }

  fields.updatedAt = getCurrentDateTime()
  db.update(sysPermission).set(fields).where(eq(sysPermission.id, id)).run()

  return ok()
}
