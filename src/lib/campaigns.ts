import type { Campaign } from "@/components/CampaignCard";

/**
 * Placeholder campaign data.
 * Replace with a real API call to the StellarAid backend once the
 * campaign endpoint is available.
 */
const mockCampaigns: Campaign[] = [
  {
    id: "clean-water-initiative",
    title: "Clean Water Initiative",
    image: "/next.svg",
    asset: "XLM",
    raised: 45000,
    target: 100000,
  },
  {
    id: "education-for-all",
    title: "Education for All",
    image: "/next.svg",
    asset: "USDC",
    raised: 25000,
    target: 75000,
  },
];

export async function getCampaign(id: string): Promise<Campaign | null> {
  const campaign = mockCampaigns.find((c) => c.id === id);
  return campaign ?? null;
}
