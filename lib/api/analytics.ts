import { apiClient } from '@/utils/apiClient';

export interface SpendingResponse {
  totalSpent?: number;
  total?: number;
  amount?: number;
  [key: string]: unknown;
}

export interface EarningsResponse {
  data?: unknown;
  earnings?: unknown[];
  monthlyEarnings?: unknown[];
  [key: string]: unknown;
}

export function getSpending() {
  return apiClient.get('/analytics/spending').then((response) => response.data);
}

export function getEarnings() {
  return apiClient.get('/analytics/earnings').then((response) => response.data);
}

export function normalizeSpending(payload: unknown): number {
  if (typeof payload === 'number') {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return 0;
  }

  const candidate = payload as Record<string, unknown>;
  const keys = [
    'totalSpent',
    'total',
    'amount',
    'spending',
    'spent',
    'totalSpentUsdc',
    'total_usdc',
    'total_spent',
  ];

  for (const key of keys) {
    const value = candidate[key];
    if (typeof value === 'number') {
      return value;
    }
  }

  if (typeof candidate.data === 'number') {
    return candidate.data;
  }

  return 0;
}
