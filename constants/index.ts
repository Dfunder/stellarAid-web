export const COMMISSION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export const PORTFOLIO_CATEGORY = {
  DIGITAL_ART: 'digital_art',
  ILLUSTRATION: 'illustration',
  PHOTOGRAPHY: 'photography',
  DESIGN: 'design',
  CONCEPT_ART: 'concept_art',
  TRADITIONAL: 'traditional',
  SCULPTURE: 'sculpture',
  OTHER: 'other',
} as const;

export const USER_ROLES = {
  ARTIST: 'artist',
  CLIENT: 'client',
  ADMIN: 'admin',
} as const;

export const SUPPORTED_ASSETS = ['XLM', 'USDC', 'NGNT', 'EURC'] as const;

export const STELLAR_NETWORK = {
  TESTNET: 'testnet',
  MAINNET: 'mainnet',
} as const;

export type CommissionStatus = (typeof COMMISSION_STATUS)[keyof typeof COMMISSION_STATUS];
export type PortfolioCategory = (typeof PORTFOLIO_CATEGORY)[keyof typeof PORTFOLIO_CATEGORY];
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type SupportedAsset = (typeof SUPPORTED_ASSETS)[number];
export type StellarNetwork = (typeof STELLAR_NETWORK)[keyof typeof STELLAR_NETWORK];

export const MATCH_FEEDBACK_SIGNAL = {
  HIRED: 'hired',
  SHORTLISTED: 'shortlisted',
  DISMISSED: 'dismissed',
  REJECTED: 'rejected',
} as const;

export const MATCH_BREAKDOWN_WEIGHTS = {
  SKILL_MATCH: 0.40,
  PORTFOLIO_RELEVANCE: 0.25,
  AVAILABILITY: 0.15,
  RATING: 0.15,
  FEEDBACK: 0.05,
} as const;

export type MatchFeedbackSignal = (typeof MATCH_FEEDBACK_SIGNAL)[keyof typeof MATCH_FEEDBACK_SIGNAL];
