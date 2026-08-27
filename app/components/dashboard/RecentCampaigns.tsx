'use client';

import React, { memo, useMemo } from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/app/store/hooks';
import {
  selectRecentActivity,
  selectDashboardLoading,
} from '@/app/features/dashboard/dashboardSelectors';

interface CampaignCardProps {
  description: string;
  timestamp: string;
}

const CampaignCard = memo(function CampaignCard({
  description,
  timestamp,
}: Readonly<CampaignCardProps>) {
  const formattedDate = useMemo(() => new Date(timestamp).toLocaleDateString(), [timestamp]);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{description}</p>
      <p className="text-xs text-gray-400 mt-1">{formattedDate}</p>
    </div>
  );
});

function RecentCampaigns() {
  const activity = useAppSelector(selectRecentActivity);
  const loading = useAppSelector(selectDashboardLoading);

  const campaigns = useMemo(
    () => activity.filter((a) => a.type === 'campaign_created').slice(0, 4),
    [activity]
  );

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!campaigns.length) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">No campaigns yet.</p>
        <Link
          href="/campaigns/new"
          className="mt-3 inline-block text-sm text-blue-600 hover:underline"
        >
          Create your first campaign
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Campaigns</h3>
        <Link href="/campaigns/new" className="text-sm text-blue-600 hover:underline">
          Create New Campaign
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            description={campaign.description}
            timestamp={campaign.timestamp}
          />
        ))}
      </div>
      <div className="mt-3 text-right">
        <Link href="/dashboard/campaigns" className="text-sm text-blue-600 hover:underline">
          View All
        </Link>
      </div>
    </div>
  );
}

export default memo(RecentCampaigns);
