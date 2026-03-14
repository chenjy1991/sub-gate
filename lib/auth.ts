import { SignJWT, jwtVerify } from 'jose'
import { hashSync, compareSync } from 'bcryptjs'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sub-admin-jwt-secret-key-2024'
)
const COOKIE_NAME = 'token'
const JWT_EXPIRES_IN = '7d'

export interface JwtPayload {
  userId: number
  username: string
  role: string
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JwtPayload
  } catch {
    return null
  }
}

export function hashPassword(password: string): string {
  return hashSync(password, 10)
}

export function verifyPassword(password: string, hash: string): boolean {
  return compareSync(password, hash)
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getAuthFromCookie(): Promise<JwtPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function requireAuth(): Promise<JwtPayload> {
  const auth = await getAuthFromCookie()
  if (!auth) {
    throw new Error('未登录或登录已过期')
  }
  return auth
}

// ========== 激活 token ==========

export interface ActivationPayload {
  userId: number
  type: 'activation'
}

export async function signActivationToken(userId: number): Promise<string> {
  return new SignJWT({ userId, type: 'activation' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

export async function verifyActivationToken(token: string): Promise<ActivationPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    if (payload.type !== 'activation') return null
    return payload as unknown as ActivationPayload
  } catch {
    return null
  }
}
