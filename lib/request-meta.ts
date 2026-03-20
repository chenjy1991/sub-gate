import type { NextRequest } from 'next/server'

function normalizeHeaderValue(value: string | null): string | null {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

export function getRequestIp(request: NextRequest): string | null {
  const forwarded = normalizeHeaderValue(request.headers.get('x-forwarded-for'))
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || null
  }

  return normalizeHeaderValue(request.headers.get('x-real-ip'))
}

export function getRequestUserAgent(request: NextRequest): string | null {
  return normalizeHeaderValue(request.headers.get('user-agent'))
}
