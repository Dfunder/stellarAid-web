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

export async function getCampaigns(query?: string): Promise<Campaign[]> {
  if (!query) return mockCampaigns;
  const lower = query.toLowerCase();
  return mockCampaigns.filter(
    (c) =>
      c.title.toLowerCase().includes(lower) ||
      c.description.toLowerCase().includes(lower),
  );
}
