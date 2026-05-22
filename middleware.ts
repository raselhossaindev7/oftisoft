import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/dashboard/(main)'];
const authPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
const publicDashboardPaths = ['/(auth)'];

function isProtectedPath(pathname: string): boolean {
  return protectedPaths.some(p => pathname.startsWith(p)) &&
    !publicDashboardPaths.some(p => pathname.startsWith(p)) &&
    !authPaths.some(p => pathname.startsWith(p));
}

function isAuthPage(pathname: string): boolean {
  return authPaths.some(p => pathname.startsWith(p));
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  requestHeaders.set('x-url', request.url);

  const hasAccessToken = request.cookies.has('access_token') || request.cookies.has('refresh_token');

  // Redirect unauthenticated users away from protected dashboard routes
  if (isProtectedPath(pathname) && !hasAccessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage(pathname) && hasAccessToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.png|favicon.svg|site.webmanifest|sw.js|og-image.svg|api/).*)',
  ],
};
