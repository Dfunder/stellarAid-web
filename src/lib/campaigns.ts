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

export type Campaign = {
  id: string;
  title: string;
  description: string;
  asset: string;
  raised: number;
  target: number;
};

const mockCampaigns: Campaign[] = [
  {
    id: "clean-water-initiative",
    title: "Clean Water Initiative",
    description: "Providing access to clean drinking water for rural communities.",
    asset: "XLM",
    raised: 45000,
    target: 100000,
  },
  {
    id: "education-for-all",
    title: "Education for All",
    description: "Funding school supplies and teacher training in underserved areas.",
    asset: "USDC",
    raised: 25000,
    target: 75000,
  },
  {
    id: "solar-energy-projects",
    title: "Solar Energy Projects",
    description: "Bringing solar power to off-grid communities.",
    asset: "XLM",
    raised: 60000,
    target: 120000,
  },
  {
    id: "food-security-program",
    title: "Food Security Program",
    description: "Supporting local food banks and community gardens.",
    asset: "USDC",
    raised: 15000,
    target: 50000,
  },
];

export async function getCampaign(id: string): Promise<Campaign | null> {
  const campaign = mockCampaigns.find((c) => c.id === id);
  return campaign ?? null;
}

export async function getCampaigns(query?: string): Promise<Campaign[]> {
  if (!query) return mockCampaigns;
  const lower = query.toLowerCase();
  return mockCampaigns.filter(
    (c) =>
      c.title.toLowerCase().includes(lower) ||
      c.description.toLowerCase().includes(lower),
  );
}
