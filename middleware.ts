import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const KNOWN_APPS = ['notes', 'tasks', 'habits', 'daily-briefing']

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const pathname = request.nextUrl.pathname

  const hostname = host.split(':')[0]
  const parts = hostname.split('.')

  let subdomain: string | null = null
  if (hostname === 'localhost') {
    subdomain = null
  } else if (hostname.endsWith('.localhost')) {
    subdomain = parts[0]
  } else if (parts.length === 2) {
    subdomain = null
  } else {
    const candidate = parts[0]
    subdomain = KNOWN_APPS.includes(candidate) ? candidate : null
  }

  const appPath = subdomain ? `/apps/${subdomain}` : '/apps/hub'
  const url = request.nextUrl.clone()

  if (!pathname.startsWith('/apps/')) {
    url.pathname = appPath + pathname
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|icon|apple-icon|app-icon|.*\\.(?:png|jpg|svg|ico|js|webmanifest)$).*)',
  ],
}
