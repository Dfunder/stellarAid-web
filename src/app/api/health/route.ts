import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TIMEOUT_MS = 3000;

async function reachable(url: string | undefined): Promise<boolean> {
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "HEAD",
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return res.status < 500;
  } catch (error) {
    console.error("health: dependency check failed", url, error);
    return false;
  }
}

export async function GET() {
  const [api, stellarRpc] = await Promise.all([
    reachable(process.env.NEXT_PUBLIC_API_BASE_URL),
    reachable(process.env.NEXT_PUBLIC_SOROBAN_RPC_URL),
  ]);
  const ok = api && stellarRpc;
  return NextResponse.json(
    {
      status: ok ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "unknown",
      dependencies: {
        api: api ? "up" : "down",
        stellarRpc: stellarRpc ? "up" : "down",
      },
    },
    { status: ok ? 200 : 503 },
  );
}
