'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, AlertTriangle } from 'lucide-react';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface CommissionDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommissionDeliveryModal({ isOpen, onClose }: CommissionDeliveryModalProps) {
  const [commissionId, setCommissionId] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('message', message);
      formData.append('commissionId', commissionId);
      files.forEach((file) => formData.append('files', file));

      const response = await fetch(`/commissions/${commissionId}/submit`, {
        method: 'PATCH',
        body: formData,
      });
      if (!response.ok) throw new Error('Unable to submit your work.');
      return response.json();
    },
    onSuccess: () => {
      setCommissionId('');
      setMessage('');
      setFiles([]);
      setFileError(null);
    },
  });

  if (!isOpen) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const selectedFiles = Array.from(event.target.files || []);
    const oversizedFiles = selectedFiles.filter((file) => file.size > MAX_FILE_SIZE_BYTES);

    if (oversizedFiles.length > 0) {
      const names = oversizedFiles.map((f) => f.name).join(', ');
      setFileError(
        `File${oversizedFiles.length > 1 ? 's' : ''} ${names} exceed${oversizedFiles.length === 1 ? 's' : ''} the ${MAX_FILE_SIZE_MB}MB size limit. Please choose smaller files.`
      );
      setFiles(selectedFiles.filter((file) => file.size <= MAX_FILE_SIZE_BYTES));
    } else {
      setFiles(selectedFiles);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (files.some((file) => file.size > MAX_FILE_SIZE_BYTES)) {
      setFileError(`One or more files exceed the ${MAX_FILE_SIZE_MB}MB size limit.`);
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Submit Work</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Upload files and send a quick note to your client.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Commission ID
            </label>
            <input
              value={commissionId}
              onChange={(event) => setCommissionId(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              placeholder="Enter commission ID"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Message
            </label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              placeholder="Share a short update with the client"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Attachments
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full rounded-lg border border-dashed border-gray-300 px-3 py-3 text-sm dark:border-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Maximum file size: {MAX_FILE_SIZE_MB}MB per file
            </p>
          </div>

          {fileError && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-700 dark:text-amber-300">{fileError}</p>
            </div>
          )}

          {files.length > 0 && (
            <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Uploaded files
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {files.map((file) => (
                  <li key={file.name} className="flex items-center justify-between">
                    <span>{file.name}</span>
                    <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mutation.isSuccess && (
            <p className="text-sm text-green-600 dark:text-green-400">
              Work submitted successfully.
            </p>
          )}
          {mutation.isError && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {(mutation.error as Error).message}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || files.length === 0}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {mutation.isPending ? 'Submitting...' : 'Submit Work'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
