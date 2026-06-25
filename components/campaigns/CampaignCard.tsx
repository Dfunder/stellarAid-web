'use client';

import Image from 'next/image';

interface CampaignCardProps {
  title: string;
  coverImage?: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  currency: string;
  endDate: string;
  donorCount: number;
  creatorAddress: string;
  isVerified?: boolean;
  isLoading?: boolean;
}

function daysRemaining(endDate: string): number {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function CampaignCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border bg-card p-4 shadow-sm space-y-3">
      <div className="h-40 rounded-xl bg-muted" />
      <div className="h-4 w-3/4 rounded bg-muted" />
      <div className="h-3 w-full rounded bg-muted" />
      <div className="h-2 w-full rounded-full bg-muted" />
      <div className="flex justify-between">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-3 w-16 rounded bg-muted" />
      </div>
    </div>
  );
}

export function CampaignCard({
  title,
  coverImage,
  description,
  goalAmount,
  raisedAmount,
  currency,
  endDate,
  donorCount,
  creatorAddress,
  isVerified = false,
  isLoading = false,
}: CampaignCardProps) {
  if (isLoading) return <CampaignCardSkeleton />;

  const pct = goalAmount > 0 ? Math.min(100, (raisedAmount / goalAmount) * 100) : 0;
  const days = daysRemaining(endDate);
  const shortAddress = `${creatorAddress.slice(0, 6)}â€¦${creatorAddress.slice(-4)}`;

  return (
    <article className="rounded-2xl border bg-card shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Cover image */}
      <div className="relative h-40 bg-muted">
        {coverImage && (
          <Image
            src={coverImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          />
        )}
        {isVerified && (
          <span className="absolute top-2 right-2 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
            Verified
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-semibold line-clamp-1">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>

        {/* Progress bar */}
        <div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
              aria-label={`${pct.toFixed(0)}% funded`}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>
              {raisedAmount.toLocaleString()} / {goalAmount.toLocaleString()} {currency}
            </span>
            <span>{pct.toFixed(0)}%</span>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{donorCount} donors</span>
          <span>{days > 0 ? `${days}d left` : 'Ended'}</span>
        </div>

        <p className="text-xs text-muted-foreground truncate" title={creatorAddress}>
          By {shortAddress}
        </p>
      </div>
    </article>
  );
}
