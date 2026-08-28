'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { useAppDispatch } from '@/app/store/hooks';
import {
  Star,
  ShieldCheck,
  Image as ImageIcon,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  X,
  Zap,
  Clock,
  Briefcase,
} from 'lucide-react';
import type { MatchResult, MatchJob } from '@/app/features/matching/matchingSlice';
import {
  findMatchesForJob,
  submitMatchFeedback as submitMatchFeedbackThunk,
} from '@/app/features/matching/matchingThunks';
import { setFeedbackSubmitted, setFeedbackSubmitted as resetFeedbackSubmitted } from '@/app/features/matching/matchingSlice';

interface RecommendedArtistsProps {
  /** Job/commission details to match against */
  job: MatchJob;
  /** Pre-computed matches (if already available) */
  matches?: MatchResult[];
  /** Number of artists to show */
  limit?: number;
  /** Show detailed breakdown */
  showBreakdown?: boolean;
  /** Callback when an artist is selected/hired */
  onHire?: (artistId: string) => void;
  /** Callback when feedback is submitted */
  onFeedback?: (artistId: string, signal: string) => void;
}

/**
 * Score badge color based on score value
 */
function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (score >= 60) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  if (score >= 40) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400';
}

/**
 * Breakdown label icon
 */
function BreakdownIcon({ label }: { label: string }) {
  const iconClass = 'w-3.5 h-3.5';
  switch (label) {
    case 'skillMatch':
      return <Zap className={iconClass} />;
    case 'portfolioRelevance':
      return <Briefcase className={iconClass} />;
    case 'availability':
      return <Clock className={iconClass} />;
    case 'rating':
      return <Star className={iconClass} />;
    case 'feedback':
      return <ThumbsUp className={iconClass} />;
    default:
      return null;
  }
}

/**
 * Breakdown label text
 */
function getBreakdownLabel(key: string): string {
  const labels: Record<string, string> = {
    skillMatch: 'Skills',
    portfolioRelevance: 'Portfolio',
    availability: 'Availability',
    rating: 'Rating',
    feedback: 'Track Record',
  };
  return labels[key] || key;
}

interface ArtistCardProps {
  match: MatchResult;
  jobId?: string;
  showBreakdown: boolean;
  onHire?: (artistId: string) => void;
  onFeedback?: (artistId: string, signal: string) => void;
}

function ArtistCard({
  match,
  jobId,
  showBreakdown,
  onHire,
  onFeedback,
}: ArtistCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const handleFeedback = async (signal: 'shortlisted' | 'dismissed') => {
    if (!jobId) return;

    try {
      await dispatch(
        submitMatchFeedbackThunk({
          jobId,
          artistId: match.artistId,
          signal,
        }),
      ).unwrap();

      setFeedbackGiven(signal);
      onFeedback?.(match.artistId, signal);
    } catch (err) {
      // Feedback submission failed silently
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Header: Avatar + Name + Score */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex-shrink-0">
            {match.artistAvatar ? (
              <NextImage
                src={match.artistAvatar}
                alt={match.artistName}
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                <ImageIcon className="w-6 h-6" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/artists/${match.artistId}`}
                className="font-semibold text-neutral-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate"
              >
                {match.artistName}
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getScoreColor(match.overallScore)}`}>
                {match.overallScore}% match
              </span>
              {match.isAvailable ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Available
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  Limited
                </span>
              )}
              {match.matchingSkillCount > 0 && (
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {match.matchingSkillCount} skill{match.matchingSkillCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Hire Button */}
          <button
            onClick={() => onHire?.(match.artistId)}
            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
          >
            Hire
          </button>
        </div>

        {/* Reasons */}
        {match.reasons.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {match.reasons.map((reason, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs rounded-full"
              >
                <Sparkles className="w-3 h-3 text-primary-500" />
                {reason}
              </span>
            ))}
          </div>
        )}

        {/* Breakdown Toggle */}
        {showBreakdown && Object.keys(match.breakdown).length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300 transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                Hide details
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                Show match breakdown
              </>
            )}
          </button>
        )}

        {/* Expanded Breakdown */}
        {expanded && (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {Object.entries(match.breakdown).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="flex items-center justify-center gap-1 text-neutral-500 dark:text-neutral-400 mb-1">
                  <BreakdownIcon label={key} />
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  {getBreakdownLabel(key)}
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5">
                  <div
                    className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${value}%` }}
                  />
                </div>
                <div className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mt-1">
                  {value}%
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feedback Buttons */}
        {feedbackGiven ? (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-500">
            {feedbackGiven === 'shortlisted' ? (
              <ThumbsUp className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <X className="w-3.5 h-3.5 text-red-500" />
            )}
            Feedback recorded
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-neutral-400">Was this helpful?</span>
            <button
              onClick={() => handleFeedback('shortlisted')}
              className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30 text-neutral-400 hover:text-green-600 transition-colors"
              title="Good match"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleFeedback('dismissed')}
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-neutral-400 hover:text-red-600 transition-colors"
              title="Not a good match"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * RecommendedArtists component
 * Shows AI-matched recommended artists for a job/commission.
 */
export default function RecommendedArtists({
  job,
  matches: propMatches,
  limit = 5,
  showBreakdown = true,
  onHire,
  onFeedback,
}: RecommendedArtistsProps) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [localMatches, setLocalMatches] = useState<MatchResult[]>(propMatches || []);

  // Use prop matches if provided, otherwise fetch
  const displayMatches = propMatches || localMatches;

  const handleFindMatches = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const results = await dispatch(findMatchesForJob(job)).unwrap();
      setLocalMatches(results.slice(0, limit));
    } catch {
      // Matches not available
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Recommended Artists
          </h3>
        </div>
        {!propMatches && displayMatches.length === 0 && !loading && (
          <button
            onClick={handleFindMatches}
            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Find Matches
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(limit)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 animate-pulse"
            >
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && displayMatches.length === 0 && (
        <div className="text-center py-8 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700">
          <Sparkles className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            No matches found yet. Click "Find Matches" to get AI-powered recommendations.
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && displayMatches.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayMatches.slice(0, limit).map((match) => (
            <ArtistCard
              key={match.artistId}
              match={match}
              jobId={job.id}
              showBreakdown={showBreakdown}
              onHire={onHire}
              onFeedback={onFeedback}
            />
          ))}
        </div>
      )}
    </div>
  );
}
