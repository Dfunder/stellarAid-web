import { NextResponse } from 'next/server';

export function GET() {
  return new NextResponse('Too Many Requests', { status: 429 });
}
