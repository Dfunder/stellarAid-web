'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Users, TrendingUp, Briefcase, PlusCircle } from 'lucide-react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import ErrorMessage from '@/app/components/common/ErrorMessage';
import Spinner from '@/app/components/common/Spinner';
import { apiClient } from '@/utils/apiClient';

type CommissionStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

interface CommissionItem {
  id: string;
  title: string;
  clientName: string;
  status: CommissionStatus;
  budgetUsdc: number;
  createdAt: string;
  teamId: string;
  teamName: string;
  rating?: number;
}

interface TeamStats {
  teamId: string;
  teamName: string;
  totalEarnings: number;
  activeProjects: number;
  averageRating: number;
}

interface DashboardStats {
  totalEarnings: number;
  totalActiveCommissions: number;
  totalPendingRequests: number;
  overallAverageRating: number;
  teamStats: TeamStats[];
}

const FALLBACK_COMMISSIONS: CommissionItem[] = [
  {
    id: 'c-101',
    title: 'Album cover art for debut EP',
    clientName: 'Tope Adekunle',
    status: 'PENDING',
    budgetUsdc: 350,
    createdAt: '2026-07-01',
    teamId: 'team-1',
    teamName: 'Design Team',
    rating: 4.9,
  },
  {
    id: 'c-102',
    title: 'Brand illustration set',
    clientName: 'Lumora HQ',
    status: 'ACTIVE',
    budgetUsdc: 600,
    createdAt: '2026-06-26',
    teamId: 'team-1',
    teamName: 'Design Team',
    rating: 4.8,
  },
  {
    id: 'c-103',
    title: 'Custom mascot for Discord server',
    clientName: 'PixelHaven DAO',
    status: 'COMPLETED',
    budgetUsdc: 220,
    createdAt: '2026-06-18',
    teamId: 'team-1',
    teamName: 'Design Team',
    rating: 5,
  },
  {
    id: 'c-104',
    title: 'E-commerce platform development',
    clientName: 'ShopLocal Inc',
    status: 'ACTIVE',
    budgetUsdc: 5000,
    createdAt: '2026-06-10',
    teamId: 'team-2',
    teamName: 'Development Team',
    rating: 4.2,
  },
  {
    id: 'c-105',
    title: 'Mobile app UI/UX design',
    clientName: 'FitLife App',
    status: 'ACTIVE',
    budgetUsdc: 3500,
    createdAt: '2026-06-03',
    teamId: 'team-1',
    teamName: 'Design Team',
    rating: 4.7,
  },
];

const FALLBACK_TEAM_STATS: TeamStats[] = [
  {
    teamId: 'team-1',
    teamName: 'Design Team',
    totalEarnings: 75000,
    activeProjects: 2,
    averageRating: 4.8,
  },
  {
    teamId: 'team-2',
    teamName: 'Development Team',
    totalEarnings: 50000,
    activeProjects: 1,
    averageRating: 4.6,
  },
];

const STATUS_BADGE: Record<CommissionStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  },
  ACTIVE: {
    label: 'Active',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  },
};

function normalizeStatus(value: unknown): CommissionStatus {
  const status = String(value ?? '').toLowerCase();

  if (['pending', 'new_request', 'new', 'requested'].includes(status)) {
    return 'PENDING';
  }

  if (['active', 'in_progress', 'in-progress', 'ongoing'].includes(status)) {
    return 'ACTIVE';
  }

  if (['completed', 'done', 'finished'].includes(status)) {
    return 'COMPLETED';
  }

  return 'CANCELLED';
}

export default function AgencyDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 0,
    totalActiveCommissions: 0,
    totalPendingRequests: 0,
    overallAverageRating: 0,
    teamStats: [],
  });
  const [commissions, setCommissions] = useState<CommissionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadOverview = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use fallback data for demonstration
        setCommissions(FALLBACK_COMMISSIONS);
        setStats({
          totalEarnings: 125000,
          totalActiveCommissions: 3,
          totalPendingRequests: 1,
          overallAverageRating: 4.7,
          teamStats: FALLBACK_TEAM_STATS,
        });
      } catch (err) {
        if (active) {
          setError('Failed to load agency dashboard. Please refresh the page to try again.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadOverview();

    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorMessage message={error} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Agency Dashboard</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              Manage your teams, projects, and earnings
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/agency/teams/new"
              className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Team
            </Link>
            <Link
              href="/dashboard/agency/portfolios/new"
              className="inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              New Portfolio
            </Link>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Earnings</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">${stats.totalEarnings.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Active Projects</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">{stats.totalActiveCommissions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Pending Requests</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">{stats.totalPendingRequests}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Avg. Rating</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">{stats.overallAverageRating.toFixed(1)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600 dark:text-purple-400 fill-current" />
              </div>
            </div>
          </div>
        </div>

        {/* Team Performance */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Team Performance</h2>
            <Link
              href="/dashboard/agency/teams"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              View all teams <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stats.teamStats.map((team) => (
              <div key={team.teamId} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white">{team.teamName}</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{team.activeProjects} active projects</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">${team.totalEarnings.toLocaleString()}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">total earnings</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current text-amber-500" />
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">{team.averageRating}</span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">average rating</span>
                  </div>
                  <Link
                    href={`/dashboard/agency/teams/${team.teamId}`}
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                  >
                    Manage team →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Commissions */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Recent Projects</h2>
            <Link
              href="/dashboard/agency/commissions"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900 dark:text-white">Project</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900 dark:text-white">Team</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900 dark:text-white">Client</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900 dark:text-white">Budget</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900 dark:text-white">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.slice(0, 5).map((commission) => (
                    <tr key={commission.id} className="border-b border-neutral-200 dark:border-neutral-800 last:border-0">
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/agency/commissions/${commission.id}`}
                          className="font-medium text-neutral-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          {commission.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">{commission.teamName}</td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">{commission.clientName}</td>
                      <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">${commission.budgetUsdc}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[commission.status].className}`}>
                          {STATUS_BADGE[commission.status].label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Missing imports
function Clock(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}

function Star(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}

function Building2(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M6 12H4a2 2 0 0 0-2 2v6h20v-6a2 2 0 0 0-2-2h-2"/><path d="M14 8h.01"/><path d="M14 12h.01"/><path d="M14 16h.01"/><path d="M10 8h.01"/><path d="M10 12h.01"/><path d="M10 16h.01"/></svg>;
}