import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, fail } from '@/lib/result'
import { sysRole } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, code, remark, status = 1 } = body

  if (!name || !code) {
    return fail('角色名称和编码不能为空')
  }

  const result = db.insert(sysRole).values({
    name,
    code,
    remark: remark || null,
    status,
  }).run()

  const role = db.select().from(sysRole).where(eq(sysRole.id, Number(result.lastInsertRowid))).get()

  return ok(role)
}
