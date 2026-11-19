import Link from "next/link";
import type { Campaign } from "@/lib/campaigns";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatAssetAmount } from "@/lib/format";
import { cn } from "@/lib/cn";

type CampaignCardProps = {
  campaign: Campaign;
  className?: string;
};

export function CampaignCard({ campaign, className }: CampaignCardProps) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/5",
        className,
      )}
    >
      <Link
        href={`/campaigns/${campaign.id}`}
        className="block focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-foreground"
      >
        <div className="flex flex-col gap-3 p-6">
          <h3 className="text-lg font-medium">{campaign.title}</h3>
          <p className="text-sm leading-6 text-foreground/80">
            {campaign.description}
          </p>
          <div className="flex justify-between text-sm text-foreground/70">
            <span>Raised: {formatAssetAmount(campaign.raised, campaign.asset)}</span>
            <span>Target: {formatAssetAmount(campaign.target, campaign.asset)}</span>
          </div>
          <ProgressBar
            value={campaign.raised}
            max={campaign.target}
            label={`${campaign.title} funding progress`}
            size="sm"
          />
        </div>
      </Link>
    </article>
  const percent = Math.min(
    100,
    Math.round((campaign.raised / campaign.target) * 100),
  );

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className={cn(
        "group block rounded-2xl border border-foreground/10 bg-foreground/5 p-6 transition-colors hover:bg-foreground/10 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-foreground",
        className,
      )}
    >
      <h3 className="text-lg font-medium">{campaign.title}</h3>
      <p className="mt-2 text-sm leading-6 text-foreground/80">
        {campaign.description}
      </p>
      <div className="mt-4 flex justify-between text-sm text-foreground/70">
        <span>Raised: {formatAssetAmount(campaign.raised, campaign.asset)}</span>
        <span>Target: {formatAssetAmount(campaign.target, campaign.asset)}</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-foreground/10">
        <div
          className="h-full rounded-full bg-foreground"
          style={{ width: `${percent}%` }}
        />
      </div>
    </Link>
  );
}
