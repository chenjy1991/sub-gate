import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok } from '@/lib/result'
import { sysUser, sysUserRole } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { id } = body

  db.delete(sysUserRole).where(eq(sysUserRole.userId, id)).run()
  db.delete(sysUser).where(eq(sysUser.id, id)).run()

  return ok()
}
