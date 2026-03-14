import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok } from '@/lib/result'
import { sysRole, sysRolePermission } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { id } = body

  db.delete(sysRolePermission).where(eq(sysRolePermission.roleId, id)).run()
  db.delete(sysRole).where(eq(sysRole.id, id)).run()

  return ok()
}
