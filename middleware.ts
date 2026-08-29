import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = [
  '/dashboard',
  '/my-campaigns',
  '/settings',
  '/admin',
  '/grants/my-applications',
  '/grants/apply',
  '/content-tiers/manage',
];
const authRoutes = ['/login', '/signup', '/register', '/forgot-password'];
const twoFactorRoutes = ['/auth/2fa'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;
  const twoFactorVerified = request.cookies.get('twoFactorVerified')?.value;

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isTwoFactorRoute = twoFactorRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtected && token && !twoFactorVerified) {
    const twoFaUrl = new URL('/auth/2fa', request.url);
    return NextResponse.redirect(twoFaUrl);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isTwoFactorRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/my-campaigns/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/grants/my-applications/:path*',
    '/grants/apply/:path*',
    '/content-tiers/manage/:path*',
    '/login',
    '/signup',
    '/register',
    '/forgot-password',
    '/auth/2fa',
  ],
};
