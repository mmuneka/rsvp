import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/admin/login'
  
  // Check if the path is for the admin area (but not login)
  const isAdminPath = path.startsWith('/admin') && !isPublicPath
  
  // Get the authentication status from cookies
  const authCookie = request.cookies.get('wedding_admin_auth')
  const isAuthenticated = authCookie?.value === 'true'

  // Redirect logic
  if (isAdminPath && !isAuthenticated) {
    // Redirect to login if trying to access admin without authentication
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (isPublicPath && isAuthenticated) {
    // Redirect to admin dashboard if already authenticated
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ['/admin/:path*'],
}