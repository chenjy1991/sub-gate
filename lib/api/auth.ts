import type { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getAuthFromCookie, type JwtPayload } from '@/lib/auth'
import { db } from '@/lib/db'
import { sysPermission, sysRole, sysRolePermission, sysUser, sysUserRole } from '@/lib/db/schema'
import { forbidden, unauthorized } from '@/lib/result'

interface PermissionNode {
  id: number
  parentId: number
  code: string
  type: string
}

export interface RequestAuth extends JwtPayload {
  permissions: string[]
  roleCodes: string[]
  status: number
}

type GuardResult =
  | { auth: RequestAuth; response: null }
  | { auth: null; response: NextResponse }

function getAncestorCodes(code: string, allPermissions: PermissionNode[]): string[] {
  const codes: string[] = []
  const byId = new Map(allPermissions.map(permission => [permission.id, permission]))
  const currentPermission = allPermissions.find(permission => permission.code === code)

  if (!currentPermission) {
    return codes
  }

  let current = byId.get(currentPermission.parentId)
  while (current) {
    codes.push(current.code)
    current = current.parentId ? byId.get(current.parentId) : undefined
  }

  return codes
}

export function getUserRoleCodes(userId: number): string[] {
  return db
    .select({ code: sysRole.code })
    .from(sysUserRole)
    .innerJoin(sysRole, eq(sysUserRole.roleId, sysRole.id))
    .where(eq(sysUserRole.userId, userId))
    .all()
    .map(row => row.code)
}

export function getUserPermissionCodes(userId: number, roleCodes = getUserRoleCodes(userId)): string[] {
  if (roleCodes.includes('ADMIN')) {
    return ['*']
  }

  const assignedPermissions = db
    .select({
      id: sysPermission.id,
      parentId: sysPermission.parentId,
      code: sysPermission.code,
      type: sysPermission.type,
    })
    .from(sysUserRole)
    .innerJoin(sysRolePermission, eq(sysUserRole.roleId, sysRolePermission.roleId))
    .innerJoin(sysPermission, eq(sysRolePermission.permissionId, sysPermission.id))
    .where(eq(sysUserRole.userId, userId))
    .all()

  const allPermissions = db
    .select({
      id: sysPermission.id,
      parentId: sysPermission.parentId,
      code: sysPermission.code,
      type: sysPermission.type,
    })
    .from(sysPermission)
    .all()

  const uniquePermissions = [...new Map(assignedPermissions.map(permission => [permission.id, permission])).values()]
  const codes = new Set<string>()

  for (const permission of uniquePermissions) {
    codes.add(permission.code)

    if (permission.type === 'button') {
      for (const ancestorCode of getAncestorCodes(permission.code, allPermissions)) {
        codes.add(ancestorCode)
      }
    }
  }

  return [...codes]
}

export function hasPermissionCode(
  auth: Pick<RequestAuth, 'permissions'>,
  requiredPermissions: string | string[]
): boolean {
  const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions]

  if (auth.permissions.includes('*')) {
    return true
  }

  return permissions.some(permission => auth.permissions.includes(permission))
}

export async function getRequestAuth(): Promise<RequestAuth | null> {
  const auth = await getAuthFromCookie()
  if (!auth) {
    return null
  }

  const user = db
    .select({
      id: sysUser.id,
      status: sysUser.status,
    })
    .from(sysUser)
    .where(eq(sysUser.id, auth.userId))
    .get()

  if (!user) {
    return null
  }

  const roleCodes = getUserRoleCodes(user.id)
  const permissions = getUserPermissionCodes(user.id, roleCodes)

  return {
    ...auth,
    userId: user.id,
    status: user.status,
    roleCodes,
    permissions,
  }
}

export async function requireRequestAuth(requiredPermissions?: string | string[]): Promise<GuardResult> {
  const auth = await getRequestAuth()

  if (!auth) {
    return {
      auth: null,
      response: unauthorized(),
    }
  }

  if (requiredPermissions && !hasPermissionCode(auth, requiredPermissions)) {
    return {
      auth: null,
      response: forbidden('无权限执行该操作'),
    }
  }

  return {
    auth,
    response: null,
  }
}
