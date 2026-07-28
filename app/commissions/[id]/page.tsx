'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, FileText, Check, X, Star } from 'lucide-react';
import toast from 'react-hot-toast';

type CommissionStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'COMPLETED'
  | 'CANCELLED';
type Role = 'artist' | 'client';

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

const MOCK_COMMISSIONS: Commission[] = [
  {
    id: 'c-001',
    title: 'Album cover art for debut EP',
    status: 'PENDING',
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
  {
    id: 'c-002',
    title: 'Brand illustration set',
    status: 'IN_PROGRESS',
    budgetUsdc: 600,
    deadline: '2026-09-01',
    description: '3 spot illustrations for the homepage hero, pricing card, and a 404 page.',
    artist: { name: 'Amara Diallo' },
    client: { name: 'Lumora HQ' },
    attachments: [{ name: 'brand-guide.pdf', size: '780 KB' }],
  },
  {
    id: 'c-003',
    title: 'Custom mascot for Discord server',
    status: 'SUBMITTED',
    budgetUsdc: 220,
    deadline: '2026-08-05',
    description: 'Single mascot character, two-color palette, scalable to 512px.',
    artist: { name: 'Wei Chen' },
    client: { name: 'PixelHaven DAO' },
    attachments: [],
  },
  {
    id: 'c-004',
    title: 'Music festival poster',
    status: 'COMPLETED',
    budgetUsdc: 480,
    deadline: '2026-07-01',
    description: 'A2 poster, hand-drawn typography, riso-friendly two-color palette.',
    artist: { name: 'Lara Ferreira' },
    client: { name: 'Festival Crew' },
    attachments: [],
  },
];

const STATUS_BADGE: Record<CommissionStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className:
      'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
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

  // Mock current-user role so both client and artist actions are demonstrable
  // without a real backend. In production this comes from the auth context.
  const [role, setRole] = useState<Role>('client');

  const badge = STATUS_BADGE[commission.status];

  const renderActions = () => {
    switch (commission.status) {
      case 'PENDING':
        return role === 'artist' ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => notice('Commission accepted')}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <Check className="h-4 w-4" />
              Accept
            </button>
            <button
              type="button"
              onClick={() => notice('Commission rejected')}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900/30"
            >
              <X className="h-4 w-4" />
              Reject
            </button>
          </div>
        ) : null;
      case 'IN_PROGRESS':
        return role === 'artist' ? (
          <button
            type="button"
            onClick={() => notice('Submit Work opened')}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Submit Work
          </button>
        ) : (
          <button
            type="button"
            onClick={() => notice('Revision requested')}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Request Revision
          </button>
        );
      case 'SUBMITTED':
        return role === 'client' ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => notice('Submission approved')}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <Check className="h-4 w-4" />
              Approve
            </button>
            <button
              type="button"
              onClick={() => notice('Revision requested')}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Request Revision
            </button>
          </div>
        ) : null;
      case 'COMPLETED':
        return role === 'client' ? (
          <button
            type="button"
            onClick={() => notice('Leave Review opened')}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
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
      className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← Back to dashboard
        </Link>

        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {commission.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Commission #{commission.id} · {commission.client.name} →{' '}
              {commission.artist.name}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}
          >
            {badge.label}
          </span>
        </header>

        <div className="rounded-xl border border-dashed border-gray-300 bg-white/60 px-3 py-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
          Viewing as{' '}
          <button
            type="button"
            onClick={() => setRole(role === 'client' ? 'artist' : 'client')}
            className="font-semibold underline-offset-2 hover:underline"
          >
            {role}
          </button>{' '}
          (toggle to preview the other role's actions)
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
            <span
              aria-current="page"
              className="border-b-2 border-blue-600 px-1 pb-3 text-sm font-medium text-blue-600"
            >
              Overview
            </span>
          </div>
        </nav>

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
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <FileText className="h-4 w-4" />
                      {a.name}
                    </span>
                    <span className="text-xs text-gray-500">{a.size}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-wrap justify-end gap-2">{renderActions()}</div>
        </div>
      </div>
    </main>
  );
}
