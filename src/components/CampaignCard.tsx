import Image from "next/image";
import { ProgressBar } from "./ui/ProgressBar";
import { cn } from "../lib/cn";

export type Campaign = {
  id: string;
  title: string;
  image: string;
  asset: string;
  raised: number;
  target: number;
};

type CampaignCardProps = {
  campaign: Campaign;
  className?: string;
};

function formatAmount(value: number, asset: string): string {
  return `${value.toLocaleString()} ${asset}`;
}

export function CampaignCard({ campaign, className }: CampaignCardProps) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/5",
        className,
      )}
    >
      <a href={`/campaigns/${campaign.id}`} className="block focus:outline-none">
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={campaign.image}
            alt={campaign.title}
            fill
            className="object-cover transition-opacity group-hover:opacity-90"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <div className="flex flex-col gap-3 p-4">
          <h3 className="text-lg font-medium">{campaign.title}</h3>
          <div className="flex justify-between text-sm text-foreground/70">
            <span>Raised: {formatAmount(campaign.raised, campaign.asset)}</span>
            <span>Target: {formatAmount(campaign.target, campaign.asset)}</span>
          </div>
          <ProgressBar
            value={campaign.raised}
            max={campaign.target}
            label={`${campaign.title} funding progress`}
            size="sm"
          />
        </div>
      </a>
    </article>
  );
}
