import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, fail } from '@/lib/result'
import { sysRolePermission } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { roleId } = body

  if (!roleId) {
    return fail('缺少角色ID')
  }

  const rows = db
    .select({ permissionId: sysRolePermission.permissionId })
    .from(sysRolePermission)
    .where(eq(sysRolePermission.roleId, roleId))
    .all()

  return ok(rows.map(r => r.permissionId))
}
