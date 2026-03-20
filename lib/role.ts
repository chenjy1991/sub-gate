export type PrimaryRole = 'admin' | 'vip' | 'user'

export function normalizeRoleCode(code: string | null | undefined): string {
  return String(code ?? '').trim().toUpperCase()
}

export function isAdminRoleCode(code: string | null | undefined): boolean {
  return normalizeRoleCode(code) === 'ADMIN'
}

export function isVipRoleCode(code: string | null | undefined): boolean {
  return normalizeRoleCode(code) === 'VIP'
}

export function resolvePrimaryRole(roleCodes: string[]): PrimaryRole {
  if (roleCodes.some(isAdminRoleCode)) {
    return 'admin'
  }

  if (roleCodes.some(isVipRoleCode)) {
    return 'vip'
  }

  return 'user'
}
