import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import EarningsChart from '../EarningsChart';

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

describe('EarningsChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders summary values and a fallback state when no data is available', () => {
    render(<EarningsChart data={[]} loading={false} error={null} />);

    expect(screen.getByText('Total earnings')).toBeInTheDocument();
    expect(screen.getAllByText('$0.00 USDC').length).toBe(2);
    expect(screen.getByText('Current month')).toBeInTheDocument();
    expect(screen.getByText('No earning data available for the last six months.')).toBeInTheDocument();
  });
});
