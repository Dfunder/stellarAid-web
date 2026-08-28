/**
 * Talent Matching Algorithm
 *
 * Scores and ranks artists for a given job (commission) based on:
 * 1. Skill match overlap (40% weight)
 * 2. Portfolio relevance by category/tags (25% weight)
 * 3. Availability (active commission count) (15% weight)
 * 4. Rating and review quality (15% weight)
 * 5. Feedback-adjusted ranking (5% weight)
 */

import type { Artist } from '@/app/features/artists/artistsSlice';
import type { Portfolio } from '@/app/features/portfolios/portfoliosSlice';
import type { Service } from '@/app/features/services/servicesSlice';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MatchRequest {
  /** Job/commission details */
  job: {
    id?: string;
    title: string;
    description: string;
    category: string;
    requiredSkills: string[];
    budget?: number;
    deadline?: string;
  };
  /** All available artists */
  artists: Artist[];
  /** All portfolios (used for relevance scoring) */
  portfolios: Portfolio[];
  /** All services (used for category matching and pricing) */
  services: Service[];
  /** Optional: active commission counts per artist (keyed by artistId) */
  activeCommissions?: Record<string, number>;
  /** Optional: feedback data for adjustment */
  feedback?: MatchFeedback[];
}

export interface MatchFeedback {
  jobId: string;
  artistId: string;
  /** Positive or negative signal */
  signal: 'hired' | 'shortlisted' | 'dismissed' | 'rejected';
  timestamp: string;
}

export interface ArtistScore {
  artist: Artist;
  /** Composite score 0-100 */
  overallScore: number;
  /** Breakdown for transparency */
  breakdown: {
    skillMatch: number;
    portfolioRelevance: number;
    availability: number;
    rating: number;
    feedback: number;
  };
  /** Explanation of why this artist was matched */
  reasons: string[];
  /** Number of matching skills */
  matchingSkillCount: number;
  /** Whether artist is actively available */
  isAvailable: boolean;
}

// ─── Scoring Weights ────────────────────────────────────────────────────────

const WEIGHTS = {
  skillMatch: 0.40,
  portfolioRelevance: 0.25,
  availability: 0.15,
  rating: 0.15,
  feedback: 0.05,
} as const;

const MAX_ACTIVE_COMMISSIONS = 5;

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Normalize a value to 0-1 range */
function normalize(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(1, value / max));
}

/** Jaccard-like similarity between two string sets */
function setOverlap(a: string[], b: string[]): { overlap: number; matched: string[] } {
  const setA = new Set(a.map((s) => s.toLowerCase()));
  const setB = new Set(b.map((s) => s.toLowerCase()));
  const matched: string[] = [];
  setA.forEach((s) => {
    if (setB.has(s)) matched.push(s);
  });
  const union = new Set([...setA, ...setB]);
  const overlap = union.size > 0 ? matched.length / union.size : 0;
  return { overlap, matched };
}

/** Compute feedback adjustment score for an artist based on historical signals */
function computeFeedbackAdjustment(
  artistId: string,
  feedback: MatchFeedback[],
): number {
  const artistFeedback = feedback.filter((f) => f.artistId === artistId);
  if (artistFeedback.length === 0) return 0.5; // Neutral when no feedback

  let positive = 0;
  let negative = 0;

  for (const f of artistFeedback) {
    if (f.signal === 'hired' || f.signal === 'shortlisted') {
      positive++;
    } else {
      negative++;
    }
  }

  const total = positive + negative;
  if (total === 0) return 0.5;

  // Decay: more recent feedback matters more
  const now = Date.now();
  let weightedPositive = 0;
  let weightedTotal = 0;

  for (const f of artistFeedback) {
    const ageMs = now - new Date(f.timestamp).getTime();
    const recency = Math.exp(-ageMs / (30 * 24 * 60 * 60 * 1000)); // 30-day half-life
    const weight = recency;
    weightedTotal += weight;
    if (f.signal === 'hired' || f.signal === 'shortlisted') {
      weightedPositive += weight;
    }
  }

  return weightedTotal > 0 ? weightedPositive / weightedTotal : 0.5;
}

/** Score artist's portfolio relevance for a given job category and tags */
function scorePortfolioRelevance(
  artistId: string,
  portfolios: Portfolio[],
  jobCategory: string,
  jobRequiredSkills: string[],
): number {
  const artistPortfolios = portfolios.filter(
    (p) => p.artistId === artistId && p.status === 'published',
  );

  if (artistPortfolios.length === 0) return 0;

  let bestScore = 0;

  for (const portfolio of artistPortfolios) {
    // Category match: exact match = 1.0, related categories can also match
    const categoryScore =
      portfolio.category.toLowerCase() === jobCategory.toLowerCase()
        ? 1.0
        : 0.2; // Partial credit for being in the platform at all

    // Tag overlap with job skills
    const { overlap: tagOverlap } = setOverlap(portfolio.tags || [], jobRequiredSkills);

    // Portfolio with items = more established
    const itemCountBonus = Math.min(1, (portfolio.items?.length || 0) / 5) * 0.1;

    const portfolioScore = categoryScore * 0.6 + tagOverlap * 0.3 + itemCountBonus;
    bestScore = Math.max(bestScore, portfolioScore);
  }

  return Math.min(1, bestScore);
}

/** Compute availability score: fewer active commissions = more available */
function scoreAvailability(
  artistId: string,
  activeCommissions?: Record<string, number>,
): number {
  if (!activeCommissions) return 0.7; // Default assumption
  const count = activeCommissions[artistId] || 0;
  return normalize(MAX_ACTIVE_COMMISSIONS - count, MAX_ACTIVE_COMMISSIONS);
}

/** Compute rating score from artist rating and review count */
function scoreRating(artist: Artist): number {
  const ratingScore = normalize(artist.rating || 0, 5);
  // Boost for having reviews (social proof)
  const reviewCountBonus = normalize(artist.reviewCount || 0, 50) * 0.2;
  const verifiedBonus = artist.verified ? 0.05 : 0;
  return Math.min(1, ratingScore * 0.8 + reviewCountBonus + verifiedBonus);
}

/** Generate human-readable match reasons */
function generateReasons(
  artist: Artist,
  breakdown: ArtistScore['breakdown'],
  matchingSkills: string[],
  jobCategory: string,
): string[] {
  const reasons: string[] = [];

  if (matchingSkills.length > 0) {
    reasons.push(
      `Matches ${matchingSkills.length} skill${matchingSkills.length > 1 ? 's' : ''}: ${matchingSkills.slice(0, 3).join(', ')}${matchingSkills.length > 3 ? '...' : ''}`,
    );
  }

  if (breakdown.portfolioRelevance > 0.5) {
    reasons.push(`Strong portfolio in ${jobCategory}`);
  }

  if (breakdown.availability > 0.7) {
    reasons.push('Currently available for new projects');
  } else if (breakdown.availability < 0.3) {
    reasons.push('Has limited availability');
  }

  if (artist.rating && artist.rating >= 4.5) {
    reasons.push(`Highly rated (${artist.rating.toFixed(1)}★)`);
  } else if (artist.rating && artist.rating >= 4.0) {
    reasons.push(`Well-rated (${artist.rating.toFixed(1)}★)`);
  }

  if (artist.verified) {
    reasons.push('Verified artist');
  }

  if (breakdown.feedback > 0.7) {
    reasons.push('Strong track record with similar jobs');
  }

  return reasons;
}

// ─── Main Algorithm ─────────────────────────────────────────────────────────

/**
 * Score and rank all artists for a given job.
 * Returns a sorted list (highest score first) with detailed breakdowns.
 */
export function matchArtists(request: MatchRequest): ArtistScore[] {
  const {
    job,
    artists,
    portfolios,
    services,
    activeCommissions,
    feedback = [],
  } = request;

  const scores: ArtistScore[] = [];

  for (const artist of artists) {
    // 1. Skill match
    const { overlap: skillOverlap, matched: matchingSkills } = setOverlap(
      artist.skills || [],
      job.requiredSkills,
    );
    const skillMatchScore = normalize(
      skillOverlap * job.requiredSkills.length,
      Math.max(job.requiredSkills.length, 1),
    );

    // Also consider service-based skill matching
    const artistServices = services.filter(
      (s) => s.artistId === artist.id && s.status === 'published',
    );
    const serviceCategoryMatch = artistServices.some(
      (s) => s.category.toLowerCase() === job.category.toLowerCase(),
    );
    const serviceSkillBonus = serviceCategoryMatch ? 0.15 : 0;

    const finalSkillScore = Math.min(1, skillMatchScore + serviceSkillBonus);

    // 2. Portfolio relevance
    const portfolioScore = scorePortfolioRelevance(
      artist.id,
      portfolios,
      job.category,
      job.requiredSkills,
    );

    // 3. Availability
    const availabilityScore = scoreAvailability(artist.id, activeCommissions);

    // 4. Rating
    const ratingScore = scoreRating(artist);

    // 5. Feedback adjustment
    const feedbackScore = computeFeedbackAdjustment(artist.id, feedback);

    // Weighted composite
    const overallScore =
      finalSkillScore * WEIGHTS.skillMatch +
      portfolioScore * WEIGHTS.portfolioRelevance +
      availabilityScore * WEIGHTS.availability +
      ratingScore * WEIGHTS.rating +
      feedbackScore * WEIGHTS.feedback;

    const breakdown = {
      skillMatch: Math.round(finalSkillScore * 100),
      portfolioRelevance: Math.round(portfolioScore * 100),
      availability: Math.round(availabilityScore * 100),
      rating: Math.round(ratingScore * 100),
      feedback: Math.round(feedbackScore * 100),
    };

    const isAvailable = availabilityScore > 0.5;

    const reasons = generateReasons(artist, breakdown, matchingSkills, job.category);

    scores.push({
      artist,
      overallScore: Math.round(overallScore * 100),
      breakdown,
      reasons,
      matchingSkillCount: matchingSkills.length,
      isAvailable,
    });
  }

  // Sort by overall score descending
  scores.sort((a, b) => b.overallScore - a.overallScore);

  return scores;
}

/**
 * Get top N recommended artists for a job.
 */
export function getTopMatches(
  request: MatchRequest,
  topN: number = 5,
): ArtistScore[] {
  return matchArtists(request).slice(0, topN);
}

/**
 * Quick skill-based search for related artists (simpler algorithm).
 * Used for the "Similar Artists" feature.
 */
export function findSimilarArtists(
  referenceArtist: Artist,
  allArtists: Artist[],
  limit: number = 4,
): (Artist & { matchingSkills: number })[] {
  return allArtists
    .filter((a) => a.id !== referenceArtist.id)
    .map((other) => {
      const { matched } = setOverlap(referenceArtist.skills || [], other.skills || []);
      return { ...other, matchingSkills: matched.length };
    })
    .filter((a) => a.matchingSkills > 0)
    .sort((a, b) => b.matchingSkills - a.matchingSkills)
    .slice(0, limit);
}

/**
 * Apply feedback learning: adjust scores based on historical job outcomes.
 * This can be used server-side to update artist profiles or recommendation weights.
 */
export function applyFeedbackLearning(
  scores: ArtistScore[],
  feedback: MatchFeedback[],
): ArtistScore[] {
  return scores.map((score) => {
    const adjustment = computeFeedbackAdjustment(score.artist.id, feedback);
    // Blend the original feedback component with the updated one
    const updatedFeedbackScore = Math.round(adjustment * 100);
    const updatedBreakdown = {
      ...score.breakdown,
      feedback: updatedFeedbackScore,
    };

    // Recalculate overall with updated feedback score
    const updatedOverall =
      (score.breakdown.skillMatch / 100) * WEIGHTS.skillMatch +
      (score.breakdown.portfolioRelevance / 100) * WEIGHTS.portfolioRelevance +
      (score.breakdown.availability / 100) * WEIGHTS.availability +
      (score.breakdown.rating / 100) * WEIGHTS.rating +
      (adjustment) * WEIGHTS.feedback;

    return {
      ...score,
      overallScore: Math.round(updatedOverall * 100),
      breakdown: updatedBreakdown,
    };
  });
}
