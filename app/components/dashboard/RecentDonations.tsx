'use client';

import Link from 'next/link';
import { useAppSelector } from '@/app/store/hooks';
import { selectRecentActivity, selectDashboardLoading } from '@/app/features/dashboard/dashboardSelectors';

export default function RecentDonations() {
  const activity = useAppSelector(selectRecentActivity);
  const loading = useAppSelector(selectDashboardLoading);
  const donations = activity.filter((a) => a.type === 'donation').slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    );
  }

  if (!donations.length) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">No recent donations found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">Description</th>
              <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((donation) => (
              <tr key={donation.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 text-gray-900 dark:text-white">{donation.description}</td>
                <td className="py-3 text-gray-500 dark:text-gray-400">
                  {new Date(donation.timestamp).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-right">
        <Link href="/dashboard/donations" className="text-sm text-blue-600 hover:underline">View All</Link>
      </div>
    </div>
  );
}
