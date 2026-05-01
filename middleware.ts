import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const pathname = request.nextUrl.pathname

  const hostname = host.split(':')[0]
  const parts = hostname.split('.')

  let subdomain: string | null = null
  if (hostname === 'localhost') {
    subdomain = null
  } else if (hostname.endsWith('.localhost')) {
    subdomain = parts[0]  // 'notes' from 'notes.localhost'
  } else if (parts.length === 2) {
    subdomain = null       // 'yourdomain.com' → hub
  } else if (parts.length >= 3) {
    subdomain = parts[0]   // 'notes.yourdomain.com' → 'notes'
  }

  const appPath = subdomain ? `/apps/${subdomain}` : '/apps/hub'
  const url = request.nextUrl.clone()

  // Avoid double-prefixing if already routed
  if (!pathname.startsWith('/apps/')) {
    url.pathname = appPath + pathname
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|svg|ico|webmanifest)$).*)'],
}
