import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { StatCard } from '../CampaignStatsWidget';
import EarningsChart from '@/components/analytics/EarningsChart';
import WalletBalance from '@/components/wallet/WalletBalance';

// Mock Redux hooks
vi.mock('@/app/store/hooks', () => ({
  useAppSelector: vi.fn((selector) =>
    selector({
      dashboard: {
        stats: {
          totalCampaigns: 12,
          activeCampaigns: 4,
          totalRaised: 54000,
          totalDonations: 128,
          totalUsers: 85,
        },
        loading: false,
        recentActivity: [],
      },
    })
  ),
  useAppDispatch: vi.fn(() => vi.fn()),
}));

// Mock Wallet Balance Hook
vi.mock('@/hooks/useWalletBalance', () => ({
  useWalletBalance: vi.fn(() => ({
    data: {
      balances: [
        { code: 'XLM', amount: '1250.50' },
        { code: 'USDC', amount: '350.00' },
      ],
    },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    error: null,
  })),
}));

// Mock Recharts ResponsiveContainer to render children directly
vi.mock('recharts', async () => {
  const original = await vi.importActual<Record<string, unknown>>('recharts');
  return {
    ...original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container" style={{ width: 500, height: 300 }}>
        {children}
      </div>
    ),
  };
});

describe('Dashboard Component Re-render Optimization', () => {
  it('StatCard renders correct label and value', () => {
    const { rerender } = render(<StatCard label="Total Raised" value="$54,000" />);
    expect(screen.getByText('Total Raised')).toBeInTheDocument();
    expect(screen.getByText('$54,000')).toBeInTheDocument();

    // Rerender with identical props
    rerender(<StatCard label="Total Raised" value="$54,000" />);
    expect(screen.getByText('Total Raised')).toBeInTheDocument();
  });

  it('EarningsChart renders title, description, and memoized earnings summary', () => {
    const mockData = [
      { month: '2026-03', amount: 400 },
      { month: '2026-04', amount: 650 },
      { month: '2026-05', amount: 900 },
      { month: '2026-06', amount: 1200 },
      { month: '2026-07', amount: 1500 },
      { month: '2026-08', amount: 1800 },
    ];

    render(
      <EarningsChart
        title="Monthly Revenue"
        description="Last six months breakdown"
        data={mockData}
      />
    );

    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    expect(screen.getByText('Last six months breakdown')).toBeInTheDocument();
    expect(screen.getByText('Total earnings')).toBeInTheDocument();
    expect(screen.getByText('$6,450.00 USDC')).toBeInTheDocument();
    expect(screen.getByText('$1,800.00 USDC')).toBeInTheDocument();
  });

  it('WalletBalance renders balances accurately with memoized row items', () => {
    render(<WalletBalance />);

    expect(screen.getByText('Wallet Balance')).toBeInTheDocument();
    expect(screen.getByText('1250.50')).toBeInTheDocument();
    expect(screen.getByText('350.00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
  });
});
