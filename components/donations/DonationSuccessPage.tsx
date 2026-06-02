"use client";

import Link from "next/link";
import { ArrowRight, Users, TrendingUp } from "lucide-react";
import { TrustBadge } from "@/components/TrustBadge";
import { useFeaturedCampaigns } from "@/hooks/useFeaturedCampaigns";
import type { Project } from "@/types/api";

function CampaignCard({ campaign }: { campaign: Project }) {
  const raised = parseFloat(campaign.currentAmount ?? "0");
  const goal = parseFloat(campaign.targetAmount ?? "1");
  const progress = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0;

  return (
    <div className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      {/* Image placeholder / gradient */}
      <div className="relative h-44 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden">
        {campaign.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-indigo-500" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <TrustBadge
            status={campaign.creator?.verified ? "verified" : "unverified"}
            size="sm"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-5 space-y-3">
        {campaign.category && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            {campaign.category}
          </span>
        )}

        <h3 className="text-base font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {campaign.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">
          {campaign.summary ?? campaign.description}
        </p>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="font-medium text-foreground">${raised.toLocaleString()} raised</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Donor count */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span>{(campaign.donorCount ?? campaign.donors ?? 0).toLocaleString()} donors</span>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="h-44 bg-muted" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-16 bg-muted rounded" />
        <div className="h-4 w-3/4 bg-muted rounded" />
        <div className="h-3 w-full bg-muted rounded" />
        <div className="h-3 w-5/6 bg-muted rounded" />
        <div className="h-2 w-full bg-muted rounded-full" />
        <div className="h-3 w-1/3 bg-muted rounded" />
      </div>
    </div>
  );
}

export function DonationSuccessPage() {
  const { data: campaigns, isLoading, isError } = useFeaturedCampaigns();

  const showSkeletons = isLoading;
  const showError = isError && !isLoading;
  const showCampaigns = !isLoading && !isError && campaigns && campaigns.length > 0;
  const showEmpty = !isLoading && !isError && (!campaigns || campaigns.length === 0);

  return (
    <section className="py-16 md:py-24 px-4 bg-background" aria-labelledby="featured-campaigns-heading">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Handpicked for you
            </p>
            <h2
              id="featured-campaigns-heading"
              className="text-3xl md:text-4xl font-extrabold text-foreground"
            >
              Featured Campaigns
            </h2>
          </div>
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-4 transition-colors shrink-0"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Error state */}
        {showError && (
          <p className="text-center text-muted-foreground py-12">
            Could not load campaigns. Please try again later.
          </p>
        )}

        {/* Empty state */}
        {showEmpty && (
          <p className="text-center text-muted-foreground py-12">
            No featured campaigns at the moment. Check back soon!
          </p>
        )}

        {/* Campaign grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {showSkeletons &&
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

          {showCampaigns &&
            campaigns.slice(0, 6).map((campaign) => (
              <Link
                key={campaign.id}
                href={`/projects/${campaign.id}`}
                className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-2xl"
              >
                <CampaignCard campaign={campaign} />
              </Link>
            ))}
        </div>

        {/* Bottom CTA */}
        {showCampaigns && (
          <div className="text-center mt-10">
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors text-sm"
            >
              Browse All Campaigns <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
