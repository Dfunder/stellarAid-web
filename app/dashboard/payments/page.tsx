'use client';

import { useMemo, useState } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import PaymentEscrowModal from '@/app/dashboard/payments/PaymentEscrowModal';

const payments = [
  {
    id: 1,
    date: '2026-07-28',
    title: 'Illustration Pack',
    counterparty: 'Ava Stone',
    amount: '320.00',
    asset: 'USDC',
    status: 'Completed',
    txHash: '44A3...9D11',
  },
  {
    id: 2,
    date: '2026-07-20',
    title: 'Brand Poster',
    counterparty: 'Liam Hart',
    amount: '150.00',
    asset: 'XLM',
    status: 'Pending',
    txHash: '7CF2...1AB8',
  },
  {
    id: 3,
    date: '2026-07-10',
    title: 'Logo Refresh',
    counterparty: 'Mina Cole',
    amount: '90.00',
    asset: 'USDC',
    status: 'Failed',
    txHash: 'A019...12CB',
  },
];

export default function PaymentsPage() {
  const [status, setStatus] = useState('all');
  const [asset, setAsset] = useState('all');
  const [page, setPage] = useState(1);
  const [isEscrowOpen, setIsEscrowOpen] = useState(false);

  const filtered = useMemo(() => {
    return payments.filter((payment) => {
      const matchesStatus = status === 'all' || payment.status.toLowerCase() === status;
      const matchesAsset = asset === 'all' || payment.asset.toLowerCase() === asset;
      return matchesStatus && matchesAsset;
    });
  }, [asset, status]);

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Payment history</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track escrow payouts, statuses, and transaction details.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <button
            onClick={() => setIsEscrowOpen(true)}
            className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white"
          >
            Fund Escrow
          </button>
          <div className="flex flex-wrap gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <option value="all">All assets</option>
            <option value="usdc">USDC</option>
            <option value="xlm">XLM</option>
          </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Commission</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Counterparty</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Asset</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Tx Hash</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((payment) => (
                <tr key={payment.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3">{payment.date}</td>
                  <td className="px-4 py-3">{payment.title}</td>
                  <td className="px-4 py-3">{payment.counterparty}</td>
                  <td className="px-4 py-3">{payment.amount}</td>
                  <td className="px-4 py-3">{payment.asset}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        payment.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : payment.status === 'Pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${payment.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-violet-600 hover:underline"
                    >
                      {payment.txHash}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <PaymentEscrowModal isOpen={isEscrowOpen} onClose={() => setIsEscrowOpen(false)} />
    </DashboardLayout>
  );
}
