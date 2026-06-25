import { MetadataRoute } from 'next';

// Mock function to fetch active campaigns
// In a real application, you would fetch this data from your API
async function getActiveCampaigns() {
  // Placeholder: Replace with actual API call
  return [
    { id: '1', lastModified: new Date() },
    { id: '2', lastModified: new Date() },
    { id: '3', lastModified: new Date() },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stellaraid.com';

  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const campaigns = await getActiveCampaigns();
  const campaignRoutes = campaigns.map((campaign) => ({
    url: `${baseUrl}/campaigns/${campaign.id}`,
    lastModified: campaign.lastModified,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  return [...staticRoutes, ...campaignRoutes];
}