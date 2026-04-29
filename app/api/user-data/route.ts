import { NextRequest, NextResponse } from 'next/server';
import { deleteUserData, getUserData, saveUserData } from '@/lib/server/userDataStore';
import type { UserDataSnapshot } from '@/types/userData';

function getWalletAddress(request: NextRequest): string | null {
  const walletAddress = request.headers.get('x-wallet-address');
  return walletAddress?.trim() || null;
}

export async function GET(request: NextRequest) {
  const walletAddress = getWalletAddress(request);

  if (!walletAddress) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
  }

  const snapshot = await getUserData(walletAddress);
  return NextResponse.json({ data: snapshot, status: 200 });
}

export async function PUT(request: NextRequest) {
  const walletAddress = getWalletAddress(request);

  if (!walletAddress) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
  }

  const body = (await request.json()) as Omit<UserDataSnapshot, 'walletAddress' | 'updatedAt'>;
  const snapshot: UserDataSnapshot = {
    walletAddress,
    bookmarks: body.bookmarks ?? [],
    drafts: body.drafts ?? [],
    preferences: body.preferences ?? {
      theme: 'system',
      analyticsConsent: null,
    },
    updatedAt: new Date().toISOString(),
  };

  const saved = await saveUserData(snapshot);
  return NextResponse.json({ data: saved, status: 200 });
}

export async function DELETE(request: NextRequest) {
  const walletAddress = getWalletAddress(request);

  if (!walletAddress) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
  }

  await deleteUserData(walletAddress);
  return NextResponse.json({ data: { deleted: true }, status: 200 });
}
