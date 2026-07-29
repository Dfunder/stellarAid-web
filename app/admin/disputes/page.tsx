'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Modal from '@/app/components/common/Modal';
import Button from '@/app/components/ui/Button';

// Types for our disputes data
interface DisputedCommission {
  id: string;
  title: string;
  client: {
    name: string;
    email: string;
  };
  artist: {
    name: string;
    email: string;
  };
  amount: number;
  disputeReason: string;
  createdAt: string;
}

// Resolution types
type ResolutionType = 'refund' | 'release' | 'partial';

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<DisputedCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<DisputedCommission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resolutionType, setResolutionType] = useState<ResolutionType>('refund');
  const [splitPercentage, setSplitPercentage] = useState(50); // client % / artist % (100 - client)
  const [submitting, setSubmitting] = useState(false);

  // Fetch disputed commissions
  const fetchDisputes = async () => {
    try {
      const response = await fetch('/admin/commissions/disputes');
      if (response.ok) {
        const data = await response.json();
        setDisputes(data);
      }
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  // Open resolve modal
  const openResolveModal = (dispute: DisputedCommission) => {
    setSelectedDispute(dispute);
    setResolutionType('refund');
    setSplitPercentage(50);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDispute(null);
  };

  // Submit resolution
  const handleSubmitResolution = async () => {
    if (!selectedDispute) return;

    setSubmitting(true);
    try {
      const payload = {
        resolution: resolutionType,
        ...(resolutionType === 'partial' && {
          clientPercentage: splitPercentage,
          artistPercentage: 100 - splitPercentage
        })
      };

      const response = await fetch(`/admin/commissions/${selectedDispute.id}/resolve-dispute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Remove the resolved dispute from the list
        setDisputes(disputes.filter(d => d.id !== selectedDispute.id));
        closeModal();
      }
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-white dark:bg-gray-800 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dispute Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage and resolve disputed commissions</p>
        </div>

        {disputes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No active disputes found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {disputes.map(dispute => (
              <div key={dispute.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {/* Commission Title */}
                  <div className="lg:col-span-1">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Commission</h3>
                    <p className="font-semibold text-gray-900 dark:text-white">{dispute.title}</p>
                  </div>

                  {/* Client */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Client</h3>
                    <p className="font-medium text-gray-900 dark:text-white">{dispute.client.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{dispute.client.email}</p>
                  </div>

                  {/* Artist */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Artist</h3>
                    <p className="font-medium text-gray-900 dark:text-white">{dispute.artist.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{dispute.artist.email}</p>
                  </div>

                  {/* Amount */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Amount</h3>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">${dispute.amount.toFixed(2)}</p>
                  </div>

                  {/* Resolve Button */}
                  <div className="flex items-end">
                    <Button
                      onClick={() => openResolveModal(dispute)}
                      className="w-full justify-center"
                    >
                      Resolve
                    </Button>
                  </div>
                </div>

                {/* Dispute Reason */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Dispute Reason</h3>
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                    {dispute.disputeReason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resolve Dispute Modal */}
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg mx-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Resolve Dispute</h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {selectedDispute && (
                <>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900 dark:text-white">{selectedDispute.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Amount: ${selectedDispute.amount.toFixed(2)}
                    </p>
                  </div>

                  {/* Resolution Type Selection */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Resolution Type</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setResolutionType('refund')}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          resolutionType === 'refund'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <p className="font-medium text-gray-900 dark:text-white">Refund</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">100% to client</p>
                      </button>
                      <button
                        onClick={() => setResolutionType('release')}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          resolutionType === 'release'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <p className="font-medium text-gray-900 dark:text-white">Release</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">100% to artist</p>
                      </button>
                      <button
                        onClick={() => setResolutionType('partial')}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          resolutionType === 'partial'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <p className="font-medium text-gray-900 dark:text-white">Partial</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Split payment</p>
                      </button>
                    </div>
                  </div>

                  {/* Partial Split Slider */}
                  {resolutionType === 'partial' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Payment Split</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Client: {splitPercentage}%</span>
                          <span className="text-gray-600 dark:text-gray-400">Artist: {100 - splitPercentage}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={splitPercentage}
                          onChange={(e) => setSplitPercentage(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>0% (Full refund)</span>
                          <span>100% (Full release)</span>
                        </div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          Client will receive: ${(selectedDispute.amount * splitPercentage / 100).toFixed(2)}
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                          Artist will receive: ${(selectedDispute.amount * (100 - splitPercentage) / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <Button variant="secondary" onClick={closeModal} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmitResolution} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Resolution'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}