'use client';

import { useEffect, useState } from 'react';
import { projectsApi } from '@/lib/api/projects';
import type { Project } from '@/types/api';
import { RelatedCampaigns } from '@/components/campaigns/RelatedCampaigns';

interface CampaignDetailPageProps {
  params: { id: string };
}

const TABS = ['About', 'Milestones', 'Donors', 'Updates', 'Contract Info'] as const;

export default function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const [campaign, setCampaign] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('About');
  const [openAccordion, setOpenAccordion] = useState<string | null>('About');

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        const response = await projectsApi.getProjectById(params.id);
        setCampaign(response.data);
      } catch (error) {
        console.error('Failed to load campaign:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaign();
  }, [params.id]);

  const pct =
    campaign && parseFloat(campaign.targetAmount) > 0
      ? Math.min(
          100,
          (parseFloat(campaign.currentAmount) / parseFloat(campaign.targetAmount)) * 100,
        )
      : 0;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="relative h-48 sm:h-64 w-full bg-muted animate-pulse" />
        <div className="mx-auto max-w-6xl px-4 py-8 space-y-4">
          <div className="h-8 w-1/3 bg-muted rounded animate-pulse" />
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
        </div>
      </main>
    );
  }

  if (!campaign) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Campaign not found</p>
      </main>
    );
  }

  const donateCard = (
    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Raised</p>
        <p className="text-2xl font-bold">
          {parseFloat(campaign.currentAmount).toLocaleString()} {campaign.currency || 'XLM'}
        </p>
        <p className="text-sm text-muted-foreground">
          of {parseFloat(campaign.targetAmount).toLocaleString()} {campaign.currency || 'XLM'} goal
        </p>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{(campaign as any).donorCount || (campaign as any).donors || 0} donors</span>
        <span>
          {(campaign as any).daysRemaining && (campaign as any).daysRemaining > 0
            ? `${(campaign as any).daysRemaining}d left`
            : 'Ended'}
        </span>
      </div>
      <button className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
        Donate Now
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Hero — images scale correctly with object-cover */}
      <div className="relative h-48 sm:h-64 w-full bg-muted">
        {campaign.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 flex items-end p-4 sm:p-6 bg-gradient-to-t from-black/50 to-transparent">
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow">
            {campaign.title}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 lg:flex lg:gap-8">
        {/* Main content */}
        <div className="flex-1">
          {/* Creator info */}
          {campaign.creator && (
            <div className="mb-6 flex items-center gap-3">
              {campaign.creator.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={campaign.creator.avatar}
                  alt={campaign.creator.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/20" />
              )}
              <div>
                <p className="text-sm text-muted-foreground">Created by</p>
                <p className="font-medium">{campaign.creator.name || 'Creator'}</p>
              </div>
            </div>
          )}

          {/* Desktop tabs — hidden on mobile */}
          <div className="mb-6 hidden md:flex gap-1 border-b">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Mobile accordion — replaces tabs on mobile */}
          <div className="md:hidden mb-6 space-y-2">
            {TABS.map((tab) => (
              <details
                key={tab}
                open={openAccordion === tab}
                onToggle={(e) => {
                  if ((e.target as HTMLDetailsElement).open) {
                    setOpenAccordion(tab);
                  } else if (openAccordion === tab) {
                    setOpenAccordion(null);
                  }
                }}
                className="rounded-lg border border-border"
              >
                <summary className="flex cursor-pointer select-none items-center justify-between px-4 py-3 text-sm font-medium">
                  {tab}
                  <span className="ml-2 text-muted-foreground">▾</span>
                </summary>
                <div className="px-4 pb-4 pt-2 text-sm text-foreground">
                  {tab === 'About' && (
                    <div className="space-y-3">
                      <p>{campaign.description}</p>
                      {(campaign as any).story && <p>{(campaign as any).story}</p>}
                    </div>
                  )}
                  {tab !== 'About' && (
                    <p className="text-muted-foreground">Content coming soon.</p>
                  )}
                </div>
              </details>
            ))}
          </div>

          {/* Desktop tab content */}
          <div className="hidden md:block space-y-4">
            {activeTab === 'About' && (
              <>
                <p className="text-foreground">{campaign.description}</p>
                {(campaign as any).story && (
                  <div className="prose prose-sm max-w-none">
                    <p>{(campaign as any).story}</p>
                  </div>
                )}
              </>
            )}
            {activeTab !== 'About' && (
              <p className="text-muted-foreground">Content coming soon.</p>
            )}
          </div>

          <RelatedCampaigns
            currentCampaignId={campaign.id}
            category={campaign.category}
          />
        </div>

        {/* Desktop sidebar */}
        <aside className="mt-8 hidden lg:block w-80 shrink-0">{donateCard}</aside>
      </div>

      {/* Mobile sticky donate button */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden p-4 bg-white dark:bg-gray-900 border-t border-border shadow-lg z-40">
        <button className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Donate Now
        </button>
      </div>
    </main>
  );
}
