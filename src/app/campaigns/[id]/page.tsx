import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";

type Campaign = {
  id: string;
  title: string;
  description: string;
  asset?: string;
  targetAmount?: string;
  imageUrl?: string;
};

const TIMEOUT_MS = 5000;

// Returns null only for a definitive 404; any other failure throws.
async function getCampaign(id: string): Promise<Campaign | null> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  const res = await fetch(
    `${base}/v1/campaigns/${encodeURIComponent(id)}`,
    { signal: AbortSignal.timeout(TIMEOUT_MS) },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Campaign request failed: ${res.status}`);
  return (await res.json()) as Campaign;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const campaign = await getCampaign(id);
    if (!campaign) return {};
    const url = `/campaigns/${encodeURIComponent(id)}`;
    return {
      title: campaign.title,
      description: campaign.description,
      alternates: { canonical: url },
      openGraph: {
        title: campaign.title,
        description: campaign.description,
        type: "website",
        url,
        siteName: siteConfig.name,
        ...(campaign.imageUrl ? { images: [campaign.imageUrl] } : {}),
      },
    };
  } catch {
    // Never fail the route because of metadata: fall back to site defaults.
    return {};
  }
}

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await getCampaign(id);
  if (!campaign) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-semibold">{campaign.title}</h1>
      <p className="mt-4">{campaign.description}</p>
      {campaign.targetAmount && campaign.asset ? (
        <p className="mt-4 text-sm">
          Goal: {campaign.targetAmount} {campaign.asset}
        </p>
      ) : null}
    </main>
  );
}
