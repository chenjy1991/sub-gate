const DEFAULT_JWT_SECRET = 'sub-admin-jwt-secret-key-2024'

export function getJwtSecret(): Uint8Array {
  const configuredSecret = process.env.JWT_SECRET?.trim()
  if (configuredSecret) {
    return new TextEncoder().encode(configuredSecret)
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('生产环境必须配置 JWT_SECRET')
  }

  return new TextEncoder().encode(DEFAULT_JWT_SECRET)
}
