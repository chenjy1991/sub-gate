import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sub-admin-jwt-secret-key-2024'
)

const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/activate',
  '/api/auth/resend-activation',
  '/api/subscribe',
  '/login',
  '/register',
  '/activate',
  '/_next',
  '/favicon.ico',
]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname.startsWith(p))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 公开路径直接放行
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // 根路径和官网路径放行
  if (pathname === '/') {
    return NextResponse.next()
  }

  // API 路由鉴权
  if (pathname.startsWith('/api/')) {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { code: 1, msg: '未登录或登录已过期', data: null },
        { status: 401 }
      )
    }
    try {
      await jwtVerify(token, JWT_SECRET)
      return NextResponse.next()
    } catch {
      return NextResponse.json(
        { code: 1, msg: '未登录或登录已过期', data: null },
        { status: 401 }
      )
    }
  }

  // /console/* 页面鉴权
  if (pathname.startsWith('/console')) {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    try {
      await jwtVerify(token, JWT_SECRET)
      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
