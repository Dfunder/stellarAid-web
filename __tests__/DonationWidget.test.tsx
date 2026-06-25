import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DonationWidget from '../components/donations/DonationWidget';

vi.mock('../store/walletStore', () => ({
  useWalletStore: vi.fn(() => ({
    address: null,
    connectedWallet: null,
    connect: vi.fn(),
  })),
}));

vi.mock('../lib/stellar/formatting', () => ({
  getBaseFee: vi.fn(() => 100),
  formatFee: vi.fn(() => '0.00001 XLM'),
}));

vi.mock('../utils/toast', () => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  toastInfo: vi.fn(),
}));

vi.mock('../components/donations/WalletConnectModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="wallet-modal">Wallet Modal</div> : null,
}));

vi.mock('../components/ui', () => ({
  Switch: ({
    checked,
    onCheckedChange,
  }: {
    checked: boolean;
    onCheckedChange: (v: boolean) => void;
  }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      data-testid="anonymous-switch"
    />
  ),
}));

describe('DonationWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with all asset options', () => {
    render(<DonationWidget />);

    expect(screen.getByText('Quick Donate')).toBeInTheDocument();
    expect(screen.getByText('Asset')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'XLM' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'USDC' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'AQUA' })).toBeInTheDocument();
  });

  it('shows estimated network fee', () => {
    render(<DonationWidget />);

    expect(screen.getByText('Estimated network fee:')).toBeInTheDocument();
    expect(screen.getByText('0.00001 XLM')).toBeInTheDocument();
  });

  it('disables submit when amount is 0 — opens wallet modal when no wallet connected', () => {
    render(<DonationWidget />);

    const customInput = screen.getByPlaceholderText('Custom amount (USD)');
    fireEvent.change(customInput, { target: { value: '' } });

    const allButtons = screen.getAllByRole('button');
    const donateBtn = allButtons.find(
      (b) => b.textContent === 'Connect Wallet to Donate',
    );
    expect(donateBtn).toBeTruthy();

    fireEvent.click(donateBtn!);
    expect(screen.getByTestId('wallet-modal')).toBeInTheDocument();
  });

  it('calls toastError when amount is 0 and wallet is connected', async () => {
    const { useWalletStore } = await import('../store/walletStore');
    const { toastError } = await import('../utils/toast');
    (useWalletStore as any).mockReturnValue({
      address: 'GEXAMPLE123ADDRESS',
      connectedWallet: null,
      connect: vi.fn(),
    });

    render(<DonationWidget />);

    const customInput = screen.getByPlaceholderText('Custom amount (USD)');
    fireEvent.change(customInput, { target: { value: '' } });

    const presets = screen.getAllByRole('button');
    presets.forEach((btn) => {
      if (btn.textContent?.startsWith('$')) {
        fireEvent.click(btn);
      }
    });

    const resetBtn = screen.getByText('Reset');
    fireEvent.click(resetBtn);

    const donateBtn = screen.getByText('Donate');
    fireEvent.click(donateBtn);

    expect(toastError).toHaveBeenCalledWith('Enter a valid donation amount');
  });

  it('renders preset amount buttons', () => {
    render(<DonationWidget />);

    expect(screen.getByText('$10')).toBeInTheDocument();
    expect(screen.getByText('$25')).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();
  });

  it('resets amount and custom input when Reset is clicked', () => {
    render(<DonationWidget />);

    const customInput = screen.getByPlaceholderText('Custom amount (USD)') as HTMLInputElement;
    fireEvent.change(customInput, { target: { value: '42' } });
    expect(customInput.value).toBe('42');

    fireEvent.click(screen.getByText('Reset'));
    expect(customInput.value).toBe('');
  });

  it('renders anonymous toggle', () => {
    render(<DonationWidget />);

    expect(screen.getByText('Donate anonymously')).toBeInTheDocument();
    expect(screen.getByTestId('anonymous-switch')).toBeInTheDocument();
  });

  it('selecting a preset clears custom amount', () => {
    render(<DonationWidget />);

    const customInput = screen.getByPlaceholderText('Custom amount (USD)') as HTMLInputElement;
    fireEvent.change(customInput, { target: { value: '99' } });

    fireEvent.click(screen.getByText('$25'));
    expect(customInput.value).toBe('');
  });

  it('shows "Donate" button text when wallet is connected', async () => {
    const { useWalletStore } = await import('../store/walletStore');
    (useWalletStore as any).mockReturnValue({
      address: 'GEXAMPLE123ADDRESS',
      connectedWallet: null,
      connect: vi.fn(),
    });

    render(<DonationWidget />);

    expect(screen.getByText('Donate')).toBeInTheDocument();
  });

  it('changing asset selection updates value', () => {
    render(<DonationWidget />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'USDC' } });
    expect(select.value).toBe('USDC');
  });
});
