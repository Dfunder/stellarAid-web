'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface CommissionDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommissionDeliveryModal({ isOpen, onClose }: CommissionDeliveryModalProps) {
  const [commissionId, setCommissionId] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    setFiles(selected);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      const formData = new FormData();
      formData.append('message', message);
      formData.append('commissionId', commissionId);
      files.forEach((file) => formData.append('files', file));

      const response = await fetch(`/commissions/${commissionId}/submit`, {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Unable to submit your work.');
      }

      setStatus('Work submitted successfully.');
      setCommissionId('');
      setMessage('');
      setFiles([]);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Submit Work</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Upload files and send a quick note to your client.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Commission ID</label>
            <input
              value={commissionId}
              onChange={(event) => setCommissionId(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              placeholder="Enter commission ID"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              placeholder="Share a short update with the client"
            />
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
            <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Uploaded files</p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {files.map((file) => (
                  <li key={file.name} className="flex items-center justify-between">
                    <span>{file.name}</span>
                    <span>{(file.size / 1024).toFixed(1)} KB</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {status && <p className="text-sm text-green-600 dark:text-green-400">{status}</p>}

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
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Submitting...' : 'Submit Work'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
