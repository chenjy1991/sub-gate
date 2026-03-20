import { and, eq } from 'drizzle-orm'
import { normalizeRoleCode } from '@/lib/role'
import { db } from './index'
import { sysPermission, sysRole, sysRolePermission, sysUser, sysUserRole } from './schema'

export function findRoleIdByCode(targetCode: string): number | null {
  const normalizedTargetCode = normalizeRoleCode(targetCode)
  const role = db
    .select({ id: sysRole.id, code: sysRole.code })
    .from(sysRole)
    .all()
    .find(row => normalizeRoleCode(row.code) === normalizedTargetCode)

  return role?.id ?? null
}

export function ensureAdminAuthorizationData() {
  const adminRoleId = findRoleIdByCode('ADMIN')

  if (!adminRoleId) {
    return
  }

  const adminUser = db
    .select({ id: sysUser.id })
    .from(sysUser)
    .where(eq(sysUser.username, 'admin'))
    .get()

  if (adminUser) {
    const existingUserRole = db
      .select({ userId: sysUserRole.userId })
      .from(sysUserRole)
      .where(and(eq(sysUserRole.userId, adminUser.id), eq(sysUserRole.roleId, adminRoleId)))
      .get()

    if (!existingUserRole) {
      db.insert(sysUserRole).values({ userId: adminUser.id, roleId: adminRoleId }).run()
    }
  }

  const permissionIds = db
    .select({ id: sysPermission.id })
    .from(sysPermission)
    .all()
    .map(row => row.id)

  if (permissionIds.length === 0) {
    return
  }

  const existingPermissionIds = new Set(
    db
      .select({ permissionId: sysRolePermission.permissionId })
      .from(sysRolePermission)
      .where(eq(sysRolePermission.roleId, adminRoleId))
      .all()
      .map(row => row.permissionId)
  )

  const missingPermissionRelations = permissionIds
    .filter(permissionId => !existingPermissionIds.has(permissionId))
    .map(permissionId => ({ roleId: adminRoleId, permissionId }))

  if (missingPermissionRelations.length > 0) {
    db.insert(sysRolePermission).values(missingPermissionRelations).run()
  }
}
