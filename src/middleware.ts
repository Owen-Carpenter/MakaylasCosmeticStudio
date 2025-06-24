import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/verify', '/auth/error']

// Public API routes that don't require authentication
const publicApiRoutes = ['/api/auth']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the path is a static file (including public folder assets)
  const isStaticFile = pathname.includes('/_next/') || 
                      pathname.includes('/favicon.ico') ||
                      pathname.startsWith('/images/') ||
                      pathname.startsWith('/models/') ||
                      pathname.startsWith('/site.webmanifest') ||
                      pathname.startsWith('/sitemap.xml') ||
                      pathname.includes('.svg') ||
                      pathname.includes('.png') ||
                      pathname.includes('.jpg') ||
                      pathname.includes('.jpeg') ||
                      pathname.includes('.gif') ||
                      pathname.includes('.glb') ||
                      pathname.includes('.gltf')
  
  // Check if the path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route)
  
  // Check if the path is a public API route
  const isPublicApiRoute = publicApiRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // If requesting a static file, public route, or public API route, allow the request to proceed
  if (isStaticFile || isPublicRoute || isPublicApiRoute) {
    return NextResponse.next()
  }
  
  // Check for session cookie
  const sessionCookie = request.cookies.get('next-auth.session-token') || 
                        request.cookies.get('__Secure-next-auth.session-token')
  
  // If there's no session cookie, redirect to login
  if (!sessionCookie) {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }
  
  // Continue with the request for authenticated users
  return NextResponse.next()
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 