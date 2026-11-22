import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { validateRouteParam } from "@/lib/route-params";
import { getCampaign } from "@/lib/campaigns";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatAssetAmount } from "@/lib/format";

type Params = { id: string };

function isValidCampaignId(id: string): boolean {
  return validateRouteParam(id).ok;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;

  if (!isValidCampaignId(id)) {
    return { title: "Campaign not found" };
  }

  const campaign = await getCampaign(id);
  if (!campaign) {
    return { title: "Campaign not found" };
  }

  return {
    title: campaign.title,
    description: `Support ${campaign.title} on StellarAid`,
    alternates: { canonical: `/campaigns/${encodeURIComponent(id)}` },
    openGraph: {
      title: campaign.title,
      description: `Support ${campaign.title} on StellarAid`,
      type: "website",
      url: `/campaigns/${encodeURIComponent(id)}`,
      siteName: siteConfig.name,
    },
  };
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  if (!isValidCampaignId(id)) {
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
