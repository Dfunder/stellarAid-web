"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, ArrowRight, Plus } from "lucide-react";
import { ProtectedRoute } from "@/lib/auth/ProtectedRoute";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { UpdateTimeline } from "@/components/creator/UpdateTimeline";

interface Campaign {
  id: string;
  title: string;
  goal: number;
  raised: number;
  donors: number;
  status: "active" | "paused" | "completed";
  progress: number;
  updatedAt: string;
}

interface Donation {
  id: string;
  campaignId: string;
  donor: string;
  amount: number;
  date: string;
}

const mockCampaigns: Campaign[] = [
  { id: "1", title: "Clean Water for Rural Schools", goal: 120000, raised: 97840, donors: 473, status: "active", progress: 81.5, updatedAt: "2h ago" },
  { id: "2", title: "Solar Microgrid in Village X", goal: 90000, raised: 35520, donors: 261, status: "active", progress: 39.5, updatedAt: "1d ago" },
  { id: "3", title: "Urban Tree Planting", goal: 45000, raised: 45000, donors: 198, status: "completed", progress: 100, updatedAt: "4d ago" },
  { id: "4", title: "Free Coding Bootcamps", goal: 75000, raised: 37500, donors: 312, status: "active", progress: 50, updatedAt: "3h ago" },
];

const mockDonations: Donation[] = [
  { id: "d1", campaignId: "1", donor: "Emma", amount: 250, date: "Today" },
  { id: "d2", campaignId: "1", donor: "Luis", amount: 100, date: "Today" },
  { id: "d3", campaignId: "2", donor: "Chen", amount: 680, date: "Yesterday" },
  { id: "d4", campaignId: "3", donor: "Aisha", amount: 50, date: "2 days ago" },
  { id: "d5", campaignId: "4", donor: "Marta", amount: 140, date: "Today" },
  { id: "d6", campaignId: "4", donor: "Ravi", amount: 90, date: "Yesterday" },
];

const trendData = [
  { month: "Oct", total: 6400 },
  { month: "Nov", total: 8200 },
  { month: "Dec", total: 7900 },
  { month: "Jan", total: 11700 },
  { month: "Feb", total: 10800 },
  { month: "Mar", total: 14200 },
  { month: "Apr", total: 15600 },
];

function DonationTrendChart() {
  const values = trendData.map((item) => item.total);
  const max = Math.max(...values, 1);
  const points = values
    .map((value, idx) => `${(idx / (values.length - 1)) * 100},${100 - (value / max) * 100}`)
    .join(" ");

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Donation Trends</h3>
        <p className="text-xs text-gray-500">Last 7 months</p>
      </div>
      <svg viewBox="0 0 100 100" className="w-full h-36">
        <polyline
          points={points}
          fill="none"
          stroke="#3461f9"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polygon points={`${points} 100,100 0,100`} fill="rgba(52,97,249,0.08)" />
      </svg>
      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
        {trendData.map((item) => (
          <span key={item.month}>{item.month}</span>
        ))}
      </div>
    </div>
  );
}

export default function CreatorDashboard() {
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);

  const activeCampaigns = useMemo(
    () => mockCampaigns.filter((camp) => camp.status === "active"),
    []
  );

  const totalRaised = useMemo(
    () => activeCampaigns.reduce((sum, camp) => sum + camp.raised, 0),
    [activeCampaigns]
  );

  const totalDonors = useMemo(
    () => new Set(mockDonations.map((donation) => donation.donor)).size,
    []
  );

  const campaignCount = activeCampaigns.length;

  const totalRaisedPrevMonth = 12800;
  const previousProgress = totalRaisedPrevMonth > 0 ? ((totalRaised - totalRaisedPrevMonth) / totalRaisedPrevMonth) * 100 : 0;

  return (
    <ProtectedRoute requiredRole="creator">
      <div className="min-h-screen bg-[#f4f7fb] p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
              <p className="text-sm text-gray-600">Track campaign performance and manage your projects.</p>
            </div>
            <Button
              variant="primary"
              className="flex items-center gap-2"
              onClick={() => {
                window.location.href = '/campaigns/create';
              }}
            >
              <Plus className="w-4 h-4" />
              Create New Campaign
            </Button>
          </header>

          {/* Quick metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <StatCard
              title="Active Campaigns"
              value={campaignCount}
              type="count"
              previousValue={campaignCount - 1}
              description="Currently live campaigns"
              info="Campaigns that are accepting donations."
              icon={<ArrowRight className="w-4 h-4 text-blue-600" />}
              iconBg="bg-blue-50"
            />
            <StatCard
              title="Total Raised"
              value={totalRaised}
              type="currency"
              currency="USD"
              previousValue={totalRaisedPrevMonth}
              description="This month"
              info="Sum of all donations received in active campaigns."
              icon={<ArrowUpRight className="w-4 h-4 text-emerald-600" />}
              iconBg="bg-emerald-50"
            />
            <StatCard
              title="Unique Donors"
              value={totalDonors}
              type="count"
              previousValue={totalDonors - 5}
              description="Supporters engaged"
              info="Number of unique donors across campaigns."
              icon={<ArrowUpRight className="w-4 h-4 text-violet-600" />}
              iconBg="bg-violet-50"
            />
          </div>

          {/* Main content columns */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <section className="xl:col-span-2 space-y-5">
              <Card variant="elevated" padding="lg">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Funding Progress</h2>
                  <p className="text-sm text-gray-500">Average of active campaigns</p>
                </div>

                <div className="space-y-3">
                  {activeCampaigns.map((campaign) => (
                    <Link
                      key={campaign.id}
                      href={`/campaigns/${campaign.id}`}
                      className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition"
                      onMouseEnter={() => setActiveCampaignId(campaign.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-800 truncate">{campaign.title}</h3>
                        <span className="text-xs font-medium text-gray-500">{campaign.progress.toFixed(1)}%</span>
                      </div>
                      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-blue-500" style={{ width: `${campaign.progress}%` }} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">${campaign.raised.toLocaleString()} raised of ${campaign.goal.toLocaleString()}</p>
                    </Link>
                  ))}
                </div>
              </Card>

              <Card variant="elevated" padding="lg">
                <DonationTrendChart />
              </Card>

              <UpdateTimeline campaignId="1" />
            </section>

            <aside className="space-y-5">
              <Card variant="elevated" padding="lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
                  <span className="px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-700">Fast access</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="secondary" fullWidth onClick={() => (window.location.href = '/campaigns/create')}>
                    Create New Campaign
                  </Button>
                  <Button variant="outline" fullWidth onClick={() => (window.location.href = '/campaigns')}>Manage Campaigns</Button>
                  <Button variant="ghost" fullWidth onClick={() => (window.location.href = '/campaigns/reports')}>Download Reports</Button>
                </div>
              </Card>

              <Card variant="elevated" padding="lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Recent Donations</h3>
                  <span className="text-xs text-gray-500">Latest 5</span>
                </div>
                <ul className="space-y-2">
                  {mockDonations.slice(0, 5).map((donation) => {
                    const campaign = mockCampaigns.find((c) => c.id === donation.campaignId);
                    return (
                      <li key={donation.id} className="flex items-start justify-between p-2 rounded-lg bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{donation.donor} donated ${donation.amount}</p>
                          <p className="text-xs text-gray-500">{campaign?.title} • {donation.date}</p>
                        </div>
                        <Link href={`/campaigns/${donation.campaignId}`} passHref>
                          <ArrowRight className="w-4 h-4 text-blue-600" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </Card>

              <Card variant="elevated" padding="lg" className="bg-blue-50">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">Live Funding Trend</h3>
                <p className="text-sm text-blue-700">
                  {`Total raised ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalRaised)} (${previousProgress.toFixed(1)}% vs previous month)`}
                </p>
              </Card>
            </aside>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
