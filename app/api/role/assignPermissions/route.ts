import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, fail } from '@/lib/result'
import { sysRolePermission } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { roleId, permissionIds } = body

  if (!roleId) {
    return fail('缺少角色ID')
  }

  db.delete(sysRolePermission).where(eq(sysRolePermission.roleId, roleId)).run()

  if (permissionIds && permissionIds.length > 0) {
    for (const permissionId of permissionIds) {
      db.insert(sysRolePermission).values({ roleId, permissionId }).run()
    }
  }

  return ok()
}
