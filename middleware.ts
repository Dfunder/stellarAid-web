import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

const ratelimits = {
  login: new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(5, '10 s'),
  }),
  api: new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
  }),
};

export const config = {
  matcher: ['/api/auth/login', '/api/users/:path*'],
};

export default async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const pathname = request.nextUrl.pathname;

  let ratelimit;
  if (pathname === '/api/auth/login') {
    ratelimit = ratelimits.login;
  } else {
    ratelimit = ratelimits.api;
  }

  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  const response = success
    ? NextResponse.next()
    : NextResponse.redirect(new URL('/api/blocked', request.url));

  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toString());

  return response;
}
