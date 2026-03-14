import { NextRequest } from 'next/server'
import { ok } from '@/lib/result'
import { clearAuthCookie } from '@/lib/auth'

export async function POST(_request: NextRequest) {
  await clearAuthCookie()
  return ok()
}
