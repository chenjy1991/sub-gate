import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sysPermission } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { parentId = 0, name, code, type = 'menu', sort = 0, remark } = body

  if (!name || !code) {
    return fail('权限名称和编码不能为空')
  }

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
