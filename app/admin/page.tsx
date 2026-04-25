'use client';

import { useState, useEffect } from 'react';

import { apiClient } from '@/lib/api/client';

import { StatCard } from '@/components/ui/StatCard';

import { Card } from '@/components/ui/Card';

interface AdminData {
  totalUsers: number;
  totalProjects: number;
  totalDonations: number;
  // Add more as needed
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/admin/dashboard')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={data?.totalUsers || 0} type="count" />
        <StatCard title="Total Projects" value={data?.totalProjects || 0} type="count" />
        <StatCard title="Total Donations" value={data?.totalDonations || 0} type="currency" currency="USD" />
      </div>
      {/* TODO: Add charts, pending actions, activity feed, date filter, quick links */}
    </div>
  );
}