import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { validateRouteParam } from "@/lib/route-params";

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
import { getCampaign } from "@/lib/campaigns";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatAssetAmount } from "@/lib/format";

type Params = { id: string };

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
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;

  if (!validateRouteParam(id).ok) {
    return { title: "Campaign not found" };
  }

  const campaign = await getCampaign(id);
  if (!campaign) {
    return { title: "Campaign not found" };
  }

  return {
    title: campaign.title,
    description: `Support ${campaign.title} on StellarAid`,
    openGraph: {
      title: campaign.title,
      description: `Support ${campaign.title} on StellarAid`,
    },
  };
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  if (!validateRouteParam(id).ok) {
    notFound();
  }

  const campaign = await getCampaign(id);

  if (!campaign) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col bg-background text-foreground">
      <Section className="py-12">
        <SectionHeading
          as="h1"
          title={campaign.title}
          description={`Raised ${formatAssetAmount(campaign.raised, campaign.asset)} of ${formatAssetAmount(campaign.target, campaign.asset)} goal`}
          action={
            <a
              href="#donate"
              className="inline-flex items-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Donate
            </a>
          }
        />

        <div className="mt-8 flex flex-col gap-8 sm:flex-row">
          <div className="flex flex-1 flex-col gap-4">
            <p className="text-foreground/80">{campaign.description}</p>
            <div className="rounded-2xl border border-foreground/10 bg-foreground/5 p-6">
              <p className="text-sm font-medium text-foreground/70">
                Funding Progress
              </p>
              <div className="mt-3">
                <ProgressBar
                  value={campaign.raised}
                  max={campaign.target}
                  label={`${campaign.title} funding progress`}
                />
              </div>
              <div className="mt-4 flex justify-between text-sm text-foreground/70">
                <span>{formatAssetAmount(campaign.raised, campaign.asset)} raised</span>
                <span>{formatAssetAmount(campaign.target, campaign.asset)} target</span>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
