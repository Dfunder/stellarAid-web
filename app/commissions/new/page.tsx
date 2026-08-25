'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import CommissionDeliveryModal from '@/components/commissions/CommissionDeliveryModal';

interface NewCommissionPageProps {
  searchParams?: {
    artistId?: string;
    artistName?: string;
    serviceTitle?: string;
    serviceDescription?: string;
    serviceBudget?: string;
  };
}

export default function NewCommissionPage({ searchParams }: NewCommissionPageProps) {
  const [artist, setArtist] = useState(searchParams?.artistName || '');
  const [title, setTitle] = useState(searchParams?.serviceTitle || '');
  const [description, setDescription] = useState(searchParams?.serviceDescription || '');
  const [budget, setBudget] = useState(searchParams?.serviceBudget || '');
  const [deadline, setDeadline] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('artist', artist);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('budget', budget);
      formData.append('deadline', deadline);
      files.forEach((file) => formData.append('attachments', file));

      const response = await fetch('/commissions', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Unable to create commission request.');
      return response.json();
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    mutation.mutate();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(event.target.files || []));
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50 px-4 py-6 dark:bg-gray-950 sm:py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-blue-600">Create Commission</p>
            <h1 className="break-words text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">Request a custom project</h1>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex min-h-[44px] items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            Back to dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Artist</label>
            <input
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              placeholder="Artist name"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              placeholder="Commission title"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              placeholder="Describe the work you want"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Budget (USDC)</label>
              <input
                type="number"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                placeholder="100"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Attachments</label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full rounded-lg border border-dashed border-gray-300 px-3 py-3 text-sm dark:border-gray-700"
            />
          </div>

          {files.length > 0 && (
            <div className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800">
              <p className="mb-2 font-medium text-gray-700 dark:text-gray-300">Selected files</p>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                {files.map((file) => (
                  <li key={file.name}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}

          {mutation.isSuccess && <p className="text-sm text-green-600 dark:text-green-400">Commission request sent successfully.</p>}
          {mutation.isError && <p className="text-sm text-red-600 dark:text-red-400">{(mutation.error as Error).message}</p>}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
            >
              {mutation.isPending ? 'Sending...' : 'Submit Request'}
            </button>
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 sm:w-auto"
            >
              Submit Work
            </button>
          </div>
        </form>
      </div>

      <CommissionDeliveryModal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} />
    </div>
  );
}
