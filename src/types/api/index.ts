/**
 * API response types (wire format) and UI model types for campaigns,
 * donations, and balances.
 *
 * Numeric amounts are kept as strings in the UI model so that 7-decimal
 * Stellar amounts retain their precision without floating-point loss.
 */

// ── Wire format (raw API response) ──────────────────────────────────

export interface ApiCampaign {
  id: string;
  title: string;
  description: string;
  creator: string;
  target_amount: number | string;
  raised_amount: number | string;
  asset_code: string;
  asset_issuer: string | null;
  status: "pending" | "active" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface ApiDonation {
  id: string;
  campaign_id: string;
  donor: string;
  amount: number | string;
  asset_code: string;
  asset_issuer: string | null;
  transaction_hash: string;
  created_at: string;
}

export interface ApiBalance {
  asset_code: string;
  asset_issuer: string | null;
  total_balance: number | string;
  available_balance: number | string;
}

// ── UI model (mapped, amounts as strings) ────────────────────────────

export interface Campaign {
  id: string;
  title: string;
  description: string;
  creator: string;
  targetAmount: string;
  raisedAmount: string;
  assetCode: string;
  assetIssuer: string | null;
  status: "pending" | "active" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface Donation {
  id: string;
  campaignId: string;
  donor: string;
  amount: string;
  assetCode: string;
  assetIssuer: string | null;
  transactionHash: string;
  createdAt: string;
}

export interface Balance {
  assetCode: string;
  assetIssuer: string | null;
  totalBalance: string;
  availableBalance: string;
}

// ── Mappers ──────────────────────────────────────────────────────────

export function mapCampaign(raw: ApiCampaign): Campaign {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    creator: raw.creator,
    targetAmount: String(raw.target_amount),
    raisedAmount: String(raw.raised_amount),
    assetCode: raw.asset_code,
    assetIssuer: raw.asset_issuer,
    status: raw.status,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export function mapDonation(raw: ApiDonation): Donation {
  return {
    id: raw.id,
    campaignId: raw.campaign_id,
    donor: raw.donor,
    amount: String(raw.amount),
    assetCode: raw.asset_code,
    assetIssuer: raw.asset_issuer,
    transactionHash: raw.transaction_hash,
    createdAt: raw.created_at,
  };
}

export function mapBalance(raw: ApiBalance): Balance {
  return {
    assetCode: raw.asset_code,
    assetIssuer: raw.asset_issuer,
    totalBalance: String(raw.total_balance),
    availableBalance: String(raw.available_balance),
  };
}
