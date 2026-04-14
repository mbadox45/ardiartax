// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')
  const { pathname } = request.nextUrl

  // 1. Jika buka "/" (root), langsung arahkan ke login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Proteksi rute "/admin": Jika tidak ada token, tendang ke login
  if (pathname.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. Jika sudah login (punya token) tapi mencoba buka "/login", arahkan ke "/admin"
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

// Tentukan rute mana saja yang akan diproses oleh middleware ini
export const config = {
  matcher: ['/', '/admin/:path*', '/login'],
}