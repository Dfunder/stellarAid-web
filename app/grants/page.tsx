'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/app/store';
import {
  fetchGrants,
  selectGrants,
  selectGrantsLoading,
  selectGrantsError,
  selectOpenGrants,
  selectVotingGrants,
} from '@/app/features/grants/grantsSelectors';
import { GrantFilters, GrantStatus } from '@/app/features/grants/grantsSlice';
import Link from 'next/link';

const GRANT_TABS: { label: string; status?: GrantStatus }[] = [
  { label: 'All Grants' },
  { label: 'Open for Applications', status: 'open' },
  { label: 'Community Voting', status: 'voting' },
  { label: 'Awarded', status: 'awarded' },
];

const CATEGORIES = [
  'All',
  'Music',
  'Visual Arts',
  'Digital Art',
  'Photography',
  'Film & Video',
  'Writing',
  'Performance',
  'Other',
];

export default function GrantsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  
  const grants = useSelector(selectGrants);
  const loading = useSelector(selectGrantsLoading);
  const error = useSelector(selectGrantsError);
  
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const filters: GrantFilters = {};
    if (GRANT_TABS[activeTab].status) {
      filters.status = GRANT_TABS[activeTab].status;
    }
    if (selectedCategory !== 'All') {
      filters.category = selectedCategory;
    }
    if (searchQuery) {
      filters.search = searchQuery;
    }
    dispatch(fetchGrants(filters));
  }, [dispatch, activeTab, selectedCategory, searchQuery]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XLM',
    }).format(amount);
  };

  const getStatusBadge = (status: GrantStatus) => {
    const badges: Record<GrantStatus, { bg: string; text: string }> = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-700' },
      open: { bg: 'bg-green-100', text: 'text-green-700' },
      voting: { bg: 'bg-blue-100', text: 'text-blue-700' },
      closed: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      awarded: { bg: 'bg-purple-100', text: 'text-purple-700' },
      distributed: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-700' },
    };
    const badge = badges[status] || badges.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Creator Grants Program</h1>
              <p className="mt-2 text-gray-600">
                Apply for grants to fund your creative projects. Community members vote on the best applications.
              </p>
            </div>
            <Link
              href="/grants/apply"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Apply for Grant
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {GRANT_TABS.map((tab, index) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(index)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === index
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[300px]">
            <input
              type="text"
              placeholder="Search grants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Grants Grid */}
        {!loading && grants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No grants found matching your criteria.</p>
          </div>
        )}

        {!loading && grants.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grants.map((grant) => (
              <div
                key={grant.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/grants/${grant.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {grant.title}
                  </h3>
                  {getStatusBadge(grant.status)}
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {grant.description}
                </p>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                    {grant.category}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Fund Amount</p>
                    <p className="text-lg font-bold text-indigo-600">
                      {formatCurrency(grant.fundAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Applications</p>
                    <p className="text-lg font-bold text-gray-900">
                      {grant.applicationCount}
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Deadline: {formatDate(grant.applicationDeadline)}
                    </span>
                    <span className="text-gray-500">
                      {grant.maxRecipients} recipients
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
