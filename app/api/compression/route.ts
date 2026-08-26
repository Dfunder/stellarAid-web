import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Generate a structured payload (~10KB uncompressed) to verify gzip compression in the Network tab
  const items = Array.from({ length: 100 }, (_, index) => ({
    id: `item-${index + 1}`,
    name: `StellarAid Grant Beneficiary Project #${index + 1}`,
    description: `Detailed project description providing transparent on-chain milestone updates for community initiative #${index + 1}.`,
    category: ['Art', 'Music', 'Technology', 'Community', 'Film', 'Education'][index % 6],
    fundingGoal: (index + 1) * 500,
    amountRaised: (index + 1) * 320,
    currency: 'USDC',
    stellarAddress: `GBBD${String(index + 1).padStart(8, '0')}XYZSTELLARAIDCOMMUNITYNETWORK`,
    isActive: true,
    tags: ['stellar', 'soroban', 'blockchain', 'grants', 'social-impact', 'community'],
  }));

  const payload = {
    success: true,
    totalCount: items.length,
    timestamp: new Date().toISOString(),
    compressionInfo: {
      gzipSupported: true,
      description:
        'API response is gzip compressed by Next.js server runtime when requested with Accept-Encoding: gzip',
    },
    data: items,
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      Vary: 'Accept-Encoding',
      'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
