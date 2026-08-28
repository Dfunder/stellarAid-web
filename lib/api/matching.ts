import api from '@/app/services/api';

export interface MatchJobRequest {
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  budget?: number;
  deadline?: string;
}

export interface MatchResult {
  artistId: string;
  overallScore: number;
  breakdown: {
    skillMatch: number;
    portfolioRelevance: number;
    availability: number;
    rating: number;
    feedback: number;
  };
  reasons: string[];
  matchingSkillCount: number;
  isAvailable: boolean;
}

export interface MatchFeedbackPayload {
  jobId: string;
  artistId: string;
  signal: 'hired' | 'shortlisted' | 'dismissed' | 'rejected';
}

/**
 * Get recommended artists for a job from the API (server-side matching).
 */
export async function getMatchesForJob(job: MatchJobRequest): Promise<MatchResult[]> {
  const { data } = await api.post('/matching/matches', job);
  return data;
}

/**
 * Get recommended artists using client-side matching with local data.
 * Falls back when API is not available.
 */
export async function getMatchesClientSide(job: MatchJobRequest): Promise<MatchResult[]> {
  const { data } = await api.post('/matching/matches/client-side', job);
  return data;
}

/**
 * Submit feedback on a match (e.g., user hired, shortlisted, or dismissed an artist).
 * This feeds into the learning algorithm.
 */
export async function submitMatchFeedback(feedback: MatchFeedbackPayload): Promise<void> {
  await api.post('/matching/feedback', feedback);
}

/**
 * Get match history for a job.
 */
export async function getMatchHistory(jobId: string): Promise<MatchResult[]> {
  const { data } = await api.get(`/matching/history/${jobId}`);
  return data;
}

/**
 * Get recommended artists for a job without going through the API.
 * Uses the client-side matching algorithm directly.
 */
export async function getLocalMatches(
  job: MatchJobRequest,
  // These would be fetched from local state or API
  artists: any[],
  portfolios: any[],
  services: any[],
  activeCommissions?: Record<string, number>,
  feedback?: any[],
): Promise<MatchResult[]> {
  // Import and use the local algorithm
  const { matchArtists } = await import('@/lib/matching/talentMatching');

  const scores = matchArtists({
    job: {
      title: job.title,
      description: job.description,
      category: job.category,
      requiredSkills: job.requiredSkills,
      budget: job.budget,
      deadline: job.deadline,
    },
    artists,
    portfolios,
    services,
    activeCommissions,
    feedback,
  });

  return scores.map((s) => ({
    artistId: s.artist.id,
    overallScore: s.overallScore,
    breakdown: s.breakdown,
    reasons: s.reasons,
    matchingSkillCount: s.matchingSkillCount,
    isAvailable: s.isAvailable,
  }));
}
