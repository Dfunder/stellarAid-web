import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'stellarAid-api',
    version: '0.1.0',
    compression: {
      enabled: true,
      supportedEncodings: ['gzip', 'deflate', 'br'],
    },
  };

  return NextResponse.json(healthData, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      Vary: 'Accept-Encoding',
      'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
