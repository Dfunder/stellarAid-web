'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Check,
  Clock,
  FileText,
  PlusCircle,
  Star,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { generatePdf } from '@/lib/pdfExport';

type CommissionStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'COMPLETED'
  | 'CANCELLED';
type Role = 'artist' | 'client';
type Tab = 'overview' | 'milestones';

interface Commission {
  id: string;
  title: string;
  status: CommissionStatus;
  budgetUsdc: number;
  deadline: string;
  description: string;
  artist: { name: string };
  client: { name: string };
  attachments: { name: string; size: string }[];
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  amountUsdc: number;
  dueDate: string;
  approved: boolean;
}

const MOCK_COMMISSIONS: Commission[] = [
  {
    id: 'c-001',
    title: 'Album cover art for debut EP',
    status: 'IN_PROGRESS',
    budgetUsdc: 350,
    deadline: '2026-08-15',
    description:
      'Original cover artwork for a 5-track EP. Bold colors, surrealist feel; please reference the mood board attached.',
    artist: { name: 'Ngozi Okafor' },
    client: { name: 'Tope Adekunle' },
    attachments: [
      { name: 'reference-moodboard.pdf', size: '1.2 MB' },
      { name: 'logo-sketch.png', size: '320 KB' },
    ],
  },
];

const MOCK_MILESTONES: Milestone[] = [
  {
    id: 'm-001',
    title: 'Initial sketches',
    description: 'Two rough sketches based on the moodboard.',
    amountUsdc: 80,
    dueDate: '2026-08-01',
    approved: true,
  },
  {
    id: 'm-002',
    title: 'Final artwork',
    description: 'Polished final cover, 4096px square, PNG + source.',
    amountUsdc: 220,
    dueDate: '2026-08-12',
    approved: false,
  },
  {
    id: 'm-003',
    title: 'Source files',
    description: 'Layered PSD/AI source and exports.',
    amountUsdc: 50,
    dueDate: '2026-08-15',
    approved: false,
  },
];

const STATUS_BADGE: Record<CommissionStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  },
  IN_PROGRESS: {
    label: 'In progress',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  },
  SUBMITTED: {
    label: 'Submitted',
    className:
      'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  },
  COMPLETED: {
    label: 'Completed',
    className:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  },
};

const notice = (label: string) => toast.success(`${label} (mock)`);

export default function CommissionDetailPage({ params }: { params: { id: string } }) {
  const commission =
    MOCK_COMMISSIONS.find((c) => c.id === params.id) ?? MOCK_COMMISSIONS[0]!;

  const [role, setRole] = useState<Role>('client');
  const [tab, setTab] = useState<Tab>('overview');
  const [milestones, setMilestones] = useState<Milestone[]>(MOCK_MILESTONES);

  const [draft, setDraft] = useState({
    title: '',
    description: '',
    amountUsdc: '',
    dueDate: '',
  });
  const [draftError, setDraftError] = useState('');

  const approvedTotal = milestones
    .filter((m) => m.approved)
    .reduce((sum, m) => sum + m.amountUsdc, 0);
  const totalProposed = milestones.reduce((sum, m) => sum + m.amountUsdc, 0);
  const pct =
    commission.budgetUsdc === 0
      ? 0
      : Math.round((approvedTotal / commission.budgetUsdc) * 100);

  const approveMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, approved: true } : m)),
    );
    notice('Milestone approved');
  };

  const addMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    setDraftError('');
    const amount = Number(draft.amountUsdc);
    if (!draft.title.trim()) {
      setDraftError('Title is required.');
      return;
    }
    if (!draft.dueDate) {
      setDraftError('Due date is required.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setDraftError('Amount must be a positive number.');
      return;
    }
    const projected = totalProposed + amount;
    if (projected > commission.budgetUsdc) {
      setDraftError(
        `Sum of milestones ($${projected} USDC) would exceed the commission budget ($${commission.budgetUsdc} USDC).`,
      );
      return;
    }
    setMilestones((prev) => [
      ...prev,
      {
        id: `m-${(prev.length + 1).toString().padStart(3, '0')}`,
        title: draft.title.trim(),
        description: draft.description.trim(),
        amountUsdc: amount,
        dueDate: draft.dueDate,
        approved: false,
      },
    ]);
    setDraft({ title: '', description: '', amountUsdc: '', dueDate: '' });
    notice('Milestone added');
  };

  const badge = STATUS_BADGE[commission.status];

  const handleExportPdf = () => {
    generatePdf({
      filename: `commission-${commission.id}.pdf`,
      title: commission.title,
      sections: [
        { heading: 'Details', content: `Commission #${commission.id}\n${commission.client.name} → ${commission.artist.name}\nStatus: ${badge.label}\nDeadline: ${commission.deadline}` },
        { heading: 'Budget', content: `$${commission.budgetUsdc.toFixed(2)} USDC` },
        { heading: 'Description', content: commission.description },
        { heading: 'Milestones', content: milestones.map((m) => `${m.approved ? '✓' : '○'} ${m.title} — $${m.amountUsdc.toFixed(2)} USDC (due ${m.dueDate})`).join('\n') },
      ],
    });
  };

  const renderActions = () => {
    switch (commission.status) {
      case 'PENDING':
        return role === 'artist' ? (
          <>
            <button
              type="button"
              onClick={() => notice('Commission accepted')}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 sm:flex-none"
            >
              <Check className="h-4 w-4" />
              Accept
            </button>
            <button
              type="button"
              onClick={() => notice('Commission rejected')}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-rose-300 px-4 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900/30 sm:flex-none"
            >
              <X className="h-4 w-4" />
              Reject
            </button>
          </>
        ) : null;
      case 'IN_PROGRESS':
        return role === 'artist' ? (
          <button
            type="button"
            onClick={() => notice('Submit Work opened')}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 sm:flex-none"
          >
            Submit Work
          </button>
        ) : (
          <button
            type="button"
            onClick={() => notice('Revision requested')}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 sm:flex-none"
          >
            Request Revision
          </button>
        );
      case 'SUBMITTED':
        return role === 'client' ? (
          <>
            <button
              type="button"
              onClick={() => notice('Submission approved')}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 sm:flex-none"
            >
              <Check className="h-4 w-4" />
              Approve
            </button>
            <button
              type="button"
              onClick={() => notice('Revision requested')}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 sm:flex-none"
            >
              Request Revision
            </button>
          </>
        ) : null;
      case 'COMPLETED':
        return role === 'client' ? (
          <button
            type="button"
            onClick={() => notice('Leave Review opened')}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 sm:flex-none"
          >
            <Star className="h-4 w-4" />
            Leave Review
          </button>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen overflow-x-hidden bg-gray-50 px-4 pb-24 pt-10 dark:bg-gray-950"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex min-h-[44px] items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← Back to dashboard
        </Link>

        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            <h1 className="break-words text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              {commission.title}
            </h1>
            <p className="mt-1 break-words text-sm text-gray-500 dark:text-gray-400">
              Commission #{commission.id} · {commission.client.name} →{' '}
              {commission.artist.name}
            </p>
          </div>
          <span
            className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}
          >
            {badge.label}
          </span>
        </header>

        <div className="rounded-xl border border-dashed border-gray-300 bg-white/60 px-3 py-2.5 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
          Viewing as{' '}
          <button
            type="button"
            onClick={() => setRole(role === 'client' ? 'artist' : 'client')}
            aria-label={`Switch to preview the ${role === 'client' ? 'artist' : 'client'} role`}
            className="min-h-[32px] min-w-[64px] rounded-md px-2 font-semibold underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            {role}
          </button>{' '}
          (toggle to preview the other role&apos;s actions)
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Budget
            </p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              ${commission.budgetUsdc.toFixed(2)} USDC
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Deadline
            </p>
            <p className="mt-1 flex items-center gap-1 text-lg font-semibold text-gray-900 dark:text-white">
              <Calendar className="h-4 w-4" />
              {commission.deadline}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Status
            </p>
            <p className="mt-1 flex items-center gap-1 text-lg font-semibold text-gray-900 dark:text-white">
              <Clock className="h-4 w-4" />
              {badge.label}
            </p>
          </div>
        </div>

        <nav
          aria-label="Commission tabs"
          className="border-b border-gray-200 dark:border-gray-800"
        >
          <div className="flex gap-6">
            {(['overview', 'milestones'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                aria-current={tab === t ? 'page' : undefined}
                className={
                  'border-b-2 px-1 pb-3 text-sm font-medium capitalize transition-colors ' +
                  (tab === t
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200')
                }
              >
                {t}
              </button>
            ))}
          </div>
        </nav>

        {tab === 'overview' ? (
          <section className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Description
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">
                {commission.description}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Attachments
              </h2>
              {commission.attachments.length === 0 ? (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  No attachments.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {commission.attachments.map((a) => (
                    <li
                      key={a.name}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-gray-700 dark:text-gray-300">
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="break-all">{a.name}</span>
                      </span>
                      <span className="shrink-0 text-xs text-gray-500">{a.size}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ) : (
          <section className="space-y-6">
            {/* Progress bar */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Milestones progress
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    ${approvedTotal.toFixed(2)} of ${commission.budgetUsdc.toFixed(2)} USDC approved
                  </p>
                </div>
                <span className="text-2xl font-bold text-blue-600">{pct}%</span>
              </div>
              <div
                className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full bg-blue-600 transition-[width] duration-300"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              {totalProposed > commission.budgetUsdc && (
                <p className="mt-3 text-xs text-rose-600 dark:text-rose-400">
                  Proposed total ${totalProposed.toFixed(2)} exceeds budget ${commission.budgetUsdc.toFixed(2)}.
                </p>
              )}
            </div>

            {/* Milestone list */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Milestones
              </h2>
              {milestones.length === 0 ? (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  No milestones defined yet.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {milestones.map((m) => (
                    <li
                      key={m.id}
                      className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {m.title}
                          </p>
                          {m.description && (
                            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                              {m.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span className="font-mono">${m.amountUsdc.toFixed(2)} USDC</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {m.dueDate}
                            </span>
                          </div>
                        </div>
                        <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
                          <span
                            className={
                              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                              (m.approved
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300')
                            }
                          >
                            {m.approved ? 'Approved' : 'Pending'}
                          </span>
                          {role === 'client' && !m.approved && (
                            <button
                              type="button"
                              onClick={() => approveMilestone(m.id)}
                              className="inline-flex min-h-[40px] items-center justify-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 sm:min-h-[32px] sm:px-3 sm:py-1.5"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Add milestone (artist only) */}
            {role === 'artist' && (
              <form
                onSubmit={addMilestone}
                className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Add milestone
                  </h2>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Proposed ${totalProposed.toFixed(2)} / Budget ${commission.budgetUsdc.toFixed(2)} USDC
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Title
                    <input
                      type="text"
                      value={draft.title}
                      onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                      required
                    />
                  </label>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Due date
                    <input
                      type="date"
                      value={draft.dueDate}
                      onChange={(e) => setDraft((d) => ({ ...d, dueDate: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                      required
                    />
                  </label>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 sm:col-span-2">
                    Description
                    <textarea
                      value={draft.description}
                      onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                      rows={2}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                    />
                  </label>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Amount (USDC)
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={draft.amountUsdc}
                      onChange={(e) => setDraft((d) => ({ ...d, amountUsdc: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                      required
                    />
                  </label>
                </div>
                {draftError && (
                  <p className="mt-3 text-xs text-rose-600 dark:text-rose-400">{draftError}</p>
                )}
                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="submit"
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 sm:w-auto"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add milestone
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {/* Action bar — sticky on mobile so Accept/Reject/Submit/Approve stay reachable */}
        <div className="sticky bottom-0 z-10 -mx-4 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-gray-800 dark:bg-gray-900/90">
          <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <button
              type="button"
              onClick={handleExportPdf}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 sm:flex-none"
            >
              <FileText className="h-4 w-4" />
              Export PDF
            </button>
            {renderActions()}
          </div>
        </div>
      </div>
    </main>
  );
}
