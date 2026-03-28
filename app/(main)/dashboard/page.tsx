'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  FolderHeart,
  Zap,
  Flame,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  ChevronRight,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { cn } from '@/lib/utils';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MONTHLY_DATA = [
  { month: 'Oct', amount: 200 },
  { month: 'Nov', amount: 350 },
  { month: 'Dec', amount: 180 },
  { month: 'Jan', amount: 420 },
  { month: 'Feb', amount: 290 },
  { month: 'Mar', amount: 450 },
];

const RECENT_DONATIONS = [
  { id: 1, project: 'Clean Water Fund', amount: 250, date: '2 hours ago', category: 'Environment', status: 'confirmed' as const },
  { id: 2, project: 'Education Initiative', amount: 100, date: '1 day ago', category: 'Education', status: 'confirmed' as const },
  { id: 3, project: 'Climate Action Campaign', amount: 75, date: '3 days ago', category: 'Climate', status: 'confirmed' as const },
  { id: 4, project: 'Food Security Program', amount: 150, date: '1 week ago', category: 'Food', status: 'confirmed' as const },
  { id: 5, project: 'Healthcare Access', amount: 200, date: '2 weeks ago', category: 'Health', status: 'confirmed' as const },
];

const RECOMMENDED = [
  {
    id: 1,
    title: 'Ocean Cleanup Initiative',
    description: 'Help remove plastic waste from our oceans and protect marine ecosystems.',
    category: 'Environment',
    raised: 42000,
    goal: 60000,
    donors: 340,
    color: 'bg-emerald-500',
  },
  {
    id: 2,
    title: "Girls' Education Fund",
    description: 'Providing scholarships and resources for girls in underserved communities.',
    category: 'Education',
    raised: 28500,
    goal: 50000,
    donors: 215,
    color: 'bg-blue-500',
  },
  {
    id: 3,
    title: 'Reforestation Africa',
    description: 'Planting 1 million trees across Sub-Saharan Africa to reverse deforestation.',
    category: 'Climate',
    raised: 71000,
    goal: 100000,
    donors: 512,
    color: 'bg-teal-500',
  },
];

const QUICK_AMOUNTS = [10, 25, 50, 100];

const CATEGORY_BADGE: Record<string, string> = {
  Environment: 'bg-emerald-100 text-emerald-700',
  Education: 'bg-blue-100 text-blue-700',
  Climate: 'bg-teal-100 text-teal-700',
  Food: 'bg-orange-100 text-orange-700',
  Health: 'bg-pink-100 text-pink-700',
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-gray-200 rounded-lg', className)} />;
}

function StatCardSkeleton() {
  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="h-3.5 w-28 mb-3" />
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      {/* Chart + Quick Donate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card variant="elevated" padding="lg">
            <Skeleton className="h-5 w-44 mb-6" />
            <Skeleton className="h-48 w-full" />
          </Card>
        </div>
        <Card variant="elevated" padding="lg">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-11 rounded-xl" />)}
          </div>
        </Card>
      </div>
      {/* Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2">
          <Card variant="elevated" padding="lg">
            <Skeleton className="h-5 w-36 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40 mb-1.5" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-14 ml-4" />
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card variant="elevated" padding="lg">
            <Skeleton className="h-5 w-44 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Donation History Chart (SVG) ─────────────────────────────────────────────

function DonationChart({ data }: { data: typeof MONTHLY_DATA }) {
  const maxAmount = Math.max(...data.map((d) => d.amount));
  const pL = 44; // padding left (y-axis labels)
  const pR = 8;
  const pT = 24;
  const pB = 36;
  const cW = 520; // chart drawing width
  const cH = 140; // chart drawing height
  const vW = pL + cW + pR;
  const vH = pT + cH + pB;
  const scale = (maxAmount * 1.15) || 1;

  const groupW = cW / data.length;
  const barW = Math.min(groupW * 0.45, 40);

  const yLabels = [0, 100, 200, 300, 400, 500].filter((v) => v <= scale);

  return (
    <svg
      viewBox={`0 0 ${vW} ${vH}`}
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Monthly donation history chart"
      role="img"
    >
      {/* Gridlines + Y-axis labels */}
      {yLabels.map((v) => {
        const y = pT + cH - (v / scale) * cH;
        return (
          <g key={v}>
            <line
              x1={pL}
              y1={y}
              x2={pL + cW}
              y2={y}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
            <text
              x={pL - 6}
              y={y + 4}
              textAnchor="end"
              fontSize="9"
              fill="#9ca3af"
            >
              ${v}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const barH = (d.amount / scale) * cH;
        const x = pL + i * groupW + (groupW - barW) / 2;
        const y = pT + cH - barH;
        const isLatest = i === data.length - 1;
        return (
          <g key={d.month}>
            {/* Bar shadow (subtle) */}
            <rect
              x={x + 2}
              y={y + 2}
              width={barW}
              height={barH}
              rx="4"
              fill={isLatest ? '#1d4ed8' : '#93c5fd'}
              opacity="0.15"
            />
            {/* Bar fill */}
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx="4"
              fill={isLatest ? '#3461f9' : '#93c5fd'}
            />
            {/* Amount label above bar */}
            <text
              x={x + barW / 2}
              y={y - 5}
              textAnchor="middle"
              fontSize="9"
              fill={isLatest ? '#1e40af' : '#6b7280'}
              fontWeight={isLatest ? '600' : '400'}
            >
              ${d.amount}
            </text>
            {/* Month label */}
            <text
              x={x + barW / 2}
              y={pT + cH + 18}
              textAnchor="middle"
              fontSize="10"
              fill={isLatest ? '#374151' : '#9ca3af'}
              fontWeight={isLatest ? '600' : '400'}
            >
              {d.month}
            </text>
          </g>
        );
      })}

      {/* X-axis baseline */}
      <line
        x1={pL}
        y1={pT + cH}
        x2={pL + cW}
        y2={pT + cH}
        stroke="#e5e7eb"
        strokeWidth="1"
      />
    </svg>
  );
}

// ─── Dashboard Content ────────────────────────────────────────────────────────

function DashboardContent() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [quickAmount, setQuickAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [quickDonated, setQuickDonated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1300);
    return () => clearTimeout(t);
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleQuickDonate = () => {
    const amt = quickAmount ?? Number(customAmount);
    if (!amt || amt <= 0) return;
    setQuickDonated(true);
    setTimeout(() => {
      setQuickDonated(false);
      setQuickAmount(null);
      setCustomAmount('');
    }, 2500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* ── Welcome ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Here&apos;s your giving activity at a glance.
          </p>
        </div>
        <Link href="/dashboard/donations">
          <Button variant="outline" size="sm" className="border-[#3461f9] text-[#3461f9] hover:bg-blue-50">
            View full history
          </Button>
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Donated"
          value={3450}
          type="currency"
          currency="USD"
          previousValue={3080}
          description="All time"
          info="Total amount donated across all campaigns"
          iconBg="bg-blue-50"
          icon={<DollarSign className="w-5 h-5 text-[#3461f9]" />}
        />
        <StatCard
          title="Projects Supported"
          value={12}
          type="count"
          previousValue={10}
          description="Active campaigns"
          info="Projects with confirmed impact from your donations"
          iconBg="bg-emerald-50"
          icon={<FolderHeart className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="Impact Score"
          value={94}
          type="percentage"
          previousValue={89}
          description="Top 8% of donors"
          info="Profile score based on giving frequency and impact"
          iconBg="bg-violet-50"
          icon={<Zap className="w-5 h-5 text-violet-600" />}
        />
        <StatCard
          title="Giving Streak"
          value={7}
          type="count"
          previousValue={6}
          description="Days this week"
          info="Consecutive days donated"
          iconBg="bg-orange-50"
          icon={<Flame className="w-5 h-5 text-orange-500" />}
        />
      </div>

      {/* ── Chart + Quick Donate ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Chart */}
        <Card variant="elevated" padding="lg" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-gray-900">Donation History</h2>
            <span className="text-xs text-gray-400">Last 6 months</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">Monthly giving overview</p>
          <DonationChart data={MONTHLY_DATA} />
        </Card>

        {/* Quick Donate */}
        <Card variant="elevated" padding="lg" className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-[#3461f9]" />
            <h2 className="text-sm font-semibold text-gray-900">Quick Donate</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Donate to <span className="font-medium text-gray-600">Ocean Cleanup Initiative</span>
          </p>

          {quickDonated ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Donation sent!</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Thank you for your generosity.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => { setQuickAmount(amt); setCustomAmount(''); }}
                    className={cn(
                      'h-11 rounded-xl text-sm font-semibold border transition-all duration-150',
                      quickAmount === amt
                        ? 'bg-[#3461f9] text-white border-[#3461f9] shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-[#3461f9] hover:text-[#3461f9] hover:bg-blue-50'
                    )}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setQuickAmount(null); }}
                  className="w-full h-11 pl-7 pr-3 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#3461f9] focus:bg-white transition-all"
                />
              </div>

              <Button
                variant="primary"
                fullWidth
                onClick={handleQuickDonate}
                disabled={!quickAmount && !customAmount}
                className="bg-[#3461f9] hover:bg-[#2d54e0] focus:ring-[#3461f9] rounded-xl"
              >
                Donate {quickAmount ? `$${quickAmount}` : customAmount ? `$${customAmount}` : ''}
              </Button>
            </>
          )}
        </Card>
      </div>

      {/* ── Recent Donations + Recommended ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Recent Donations */}
        <Card variant="elevated" padding="lg" className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent Donations</h2>
            <Link
              href="/dashboard/donations"
              className="text-xs text-[#3461f9] hover:underline font-medium flex items-center gap-0.5"
            >
              See all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex-1 divide-y divide-gray-100">
            {RECENT_DONATIONS.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{d.project}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="text-xs text-gray-400">{d.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-sm font-semibold text-gray-900">
                    +${d.amount}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                      CATEGORY_BADGE[d.category] ?? 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {d.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommended Projects */}
        <Card variant="elevated" padding="lg" className="lg:col-span-3 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Recommended for You</h2>
            <Link
              href="/dashboard/projects"
              className="text-xs text-[#3461f9] hover:underline font-medium flex items-center gap-0.5"
            >
              Browse all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex-1 space-y-4">
            {RECOMMENDED.map((p) => {
              const pct = Math.round((p.raised / p.goal) * 100);
              return (
                <div key={p.id} className="flex gap-4">
                  {/* Color swatch */}
                  <div
                    className={cn(
                      'w-14 h-14 rounded-xl flex items-center justify-center shrink-0',
                      p.color
                    )}
                  >
                    <FolderHeart className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{p.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{p.description}</p>
                      </div>
                      <span
                        className={cn(
                          'text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0',
                          CATEGORY_BADGE[p.category] ?? 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {p.category}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">
                          ${p.raised.toLocaleString()} raised
                        </span>
                        <span className="text-xs font-medium text-gray-700">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#3461f9] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] text-gray-400">{p.donors} donors</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link href="/dashboard/projects">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                className="border-[#3461f9] text-[#3461f9] hover:bg-blue-50 rounded-xl"
              >
                Explore more projects
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
