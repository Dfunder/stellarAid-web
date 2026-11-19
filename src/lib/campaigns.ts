// Caching model for campaign data:
// - campaign list: revalidated every 5 minutes, tagged so mutations can invalidate it
// - balances / wallet-scoped data: dynamic, never cached (no-store)
export const CAMPAIGNS_TAG = "campaigns";
export const CAMPAIGNS_REVALIDATE_SECONDS = 300;

const apiUrl = process.env.API_URL ?? "";

export async function fetchCampaigns() {
  const res = await fetch(`${apiUrl}/campaigns`, {
    next: { revalidate: CAMPAIGNS_REVALIDATE_SECONDS, tags: [CAMPAIGNS_TAG] },
  });
  if (!res.ok) throw new Error(`Failed to load campaigns (${res.status})`);
  return res.json();
}

export async function fetchBalance(account: string) {
  const res = await fetch(`${apiUrl}/accounts/${encodeURIComponent(account)}/balance`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load balance (${res.status})`);
  return res.json();
}
