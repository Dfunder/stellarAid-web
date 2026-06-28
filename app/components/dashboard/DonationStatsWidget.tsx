'use client';

import { useAppSelector } from '@/app/store/hooks';
import { selectDashboardStats, selectDashboardLoading } from '@/app/features/dashboard/dashboardSelectors';

interface StatCardProps {
  label: string;
  value: string | number;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}

export default function DonationStatsWidget() {
  const stats = useAppSelector(selectDashboardStats);
  const loading = useAppSelector(selectDashboardLoading);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-20" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No donation data available.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard label="Total Donated" value={"$" + stats.totalRaised.toLocaleString()} />
      <StatCard label="Total Donations" value={stats.totalDonations} />
      <StatCard label="Campaigns Supported" value={stats.activeCampaigns} />
      <StatCard label="Total Users" value={stats.totalUsers} />
    </div>
  );
}
