import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, fail } from '@/lib/result'
import { sysRole } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { id, name, code, remark, status } = body

  if (!id) {
    return fail('缺少角色ID')
  }

  const updates: Record<string, unknown> = {}
  if (name !== undefined && name !== null) updates.name = name
  if (code !== undefined && code !== null) updates.code = code
  if (remark !== undefined) updates.remark = remark
  if (status !== undefined && status !== null) updates.status = status

  if (Object.keys(updates).length > 0) {
    db.update(sysRole).set(updates).where(eq(sysRole.id, id)).run()
  }

  return ok()
}
