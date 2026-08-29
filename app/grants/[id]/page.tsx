'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/app/store';
import {
  fetchGrantById,
  fetchGrantApplications,
  castVote,
  selectCurrentGrant,
  selectApplications,
  selectGrantsLoading,
  selectTopVotedApplications,
  selectUserVotes,
  selectHasUserApplied,
} from '@/app/features/grants/grantsSelectors';
import { VoteType } from '@/app/features/grants/grantsSlice';
import { selectCurrentUser } from '@/app/features/auth/authSlice';
import Link from 'next/link';

export default function GrantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const grantId = params.id as string;
  const grant = useSelector(selectCurrentGrant);
  const applications = useSelector(selectApplications);
  const topApplications = useSelector(selectTopVotedApplications);
  const loading = useSelector(selectGrantsLoading);
  const userVotes = useSelector(selectUserVotes);
  const user = useSelector(selectCurrentUser);
  
  const hasApplied = useSelector(selectHasUserApplied(grantId));

  useEffect(() => {
    if (grantId) {
      dispatch(fetchGrantById(grantId));
      dispatch(fetchGrantApplications(grantId));
    }
  }, [dispatch, grantId]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XLM',
    }).format(amount);
  };

  const handleVote = async (applicationId: string, voteType: VoteType) => {
    if (!user) {
      router.push('/login');
      return;
    }
    await dispatch(castVote({ applicationId, voteType }));
  };

  if (loading && !grant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!grant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Grant Not Found</h2>
          <Link href="/grants" className="text-indigo-600 hover:underline">
            Back to Grants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Grants
        </button>

        {/* Grant Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{grant.title}</h1>
              <p className="text-gray-600 text-lg leading-relaxed">{grant.description}</p>
            </div>
            <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
              {grant.category}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-600">{formatCurrency(grant.fundAmount)}</p>
              <p className="text-sm text-gray-500">Total Fund</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{grant.maxRecipients}</p>
              <p className="text-sm text-gray-500">Recipients</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{grant.applicationCount}</p>
              <p className="text-sm text-gray-500">Applications</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{grant.totalVotes}</p>
              <p className="text-sm text-gray-500">Total Votes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500 mb-1">Application Deadline</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(grant.applicationDeadline)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Voting Deadline</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(grant.votingDeadline)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            {grant.status === 'open' && !hasApplied && (
              <Link
                href={`/grants/apply?grantId=${grant.id}`}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Apply for This Grant
              </Link>
            )}
            {hasApplied && (
              <span className="px-6 py-3 bg-green-100 text-green-700 rounded-lg font-medium">
                ✓ You've Applied
              </span>
            )}
            {grant.status === 'voting' && (
              <Link
                href={`/grants/voting?grantId=${grant.id}`}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Vote on Applications
              </Link>
            )}
            <Link
              href={`/grants/impact?grantId=${grant.id}`}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              View Impact
            </Link>
          </div>
        </div>

        {/* Applications Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Applications ({applications.length})
          </h2>

          {applications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No applications yet. Be the first to apply!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topApplications.map((application) => (
                <div
                  key={application.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{application.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {application.description}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-sm text-gray-500">
                          Budget: {formatCurrency(application.budget)}
                        </span>
                        <span className="text-sm text-gray-500">
                          Timeline: {application.timeline}
                        </span>
                      </div>
                    </div>
                    
                    {/* Voting Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleVote(application.id, 'upvote')}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          userVotes[application.id] === 'upvote'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        {application.upvotes}
                      </button>
                      <button
                        onClick={() => handleVote(application.id, 'downvote')}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          userVotes[application.id] === 'downvote'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        {application.downvotes}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
