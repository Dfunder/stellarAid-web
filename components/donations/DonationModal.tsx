'use client';

import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from '@/components/ui';
import { AssetSelector, SUPPORTED_ASSETS, type DonationAsset } from './AssetSelector';
import { Heart, Info } from 'lucide-react';

export interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    title: string;
    imageUrl?: string;
  };
  onDonate?: (payload: DonationPayload) => Promise<void>;
}

export interface DonationPayload {
  projectId: string;
  amount: number;
  asset: DonationAsset;
  message: string;
  anonymous: boolean;
}

const QUICK_AMOUNTS = [5, 10, 25, 50];
const TX_FEE_XLM = 0.00001;

export function DonationModal({ isOpen, onClose, project, onDonate }: DonationModalProps) {
  const [rawAmount, setRawAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<DonationAsset>(SUPPORTED_ASSETS[0]);
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const amount = parseFloat(rawAmount) || 0;
  const usdEquivalent = (amount * selectedAsset.usdRate).toFixed(2);
  const txFeeUsd = (TX_FEE_XLM * SUPPORTED_ASSETS[0].usdRate).toFixed(4);

  function handleQuickAmount(val: number) {
    const assetAmount = (val / selectedAsset.usdRate).toFixed(4);
    setRawAmount(assetAmount);
    setError('');
  }

  function handleAssetChange(asset: DonationAsset) {
    setSelectedAsset(asset);
    if (amount > 0) {
      const currentUsd = amount * selectedAsset.usdRate;
      setRawAmount((currentUsd / asset.usdRate).toFixed(4));
    }
  }

  function validate(): boolean {
    if (!amount || amount <= 0) {
      setError('Please enter a valid donation amount.');
      return false;
    }
    if (amount * selectedAsset.usdRate < 0.5) {
      setError('Minimum donation is $0.50 USD equivalent.');
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onDonate?.({
        projectId: project.id,
        amount,
        asset: selectedAsset,
        message,
        anonymous,
      });
      handleClose();
    } catch {
      setError('Donation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setRawAmount('');
    setMessage('');
    setAnonymous(false);
    setError('');
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      variant="centered"
      size="md"
      aria-labelledby="donation-modal-title"
    >
      <ModalHeader onClose={handleClose} showCloseButton>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-full">
            <Heart className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 id="donation-modal-title" className="text-lg font-semibold text-gray-900">
              Donate to Project
            </h2>
            <p className="text-sm text-gray-500 truncate max-w-xs">{project.title}</p>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="space-y-5">
        {/* Project image */}
        {project.imageUrl && (
          <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100">
            <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Quick amounts */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Amount (USD)</p>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map((v) => {
              const assetAmt = parseFloat((v / selectedAsset.usdRate).toFixed(4));
              const active = Math.abs(amount - assetAmt) < 0.0001;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleQuickAmount(v)}
                  className={`py-2 text-sm font-medium rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${active
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                >
                  ${v}
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount input */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Amount
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="any"
              value={rawAmount}
              onChange={(e) => { setRawAmount(e.target.value); setError(''); }}
              placeholder="0.00"
              className="w-full pr-20 pl-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 select-none">
              {selectedAsset.code}
            </span>
          </div>
          {amount > 0 && (
            <p className="mt-1 text-xs text-gray-400">≈ ${usdEquivalent} USD</p>
          )}
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        {/* Asset selector */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Asset</label>
          <AssetSelector
            value={selectedAsset.code}
            onChange={handleAssetChange}
            donationAmount={amount}
          />
        </div>

        {/* Tx fee */}
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Estimated network fee: ~{TX_FEE_XLM} XLM (≈${txFeeUsd} USD)</span>
        </div>

        {/* Message */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Message <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={200}
            rows={2}
            placeholder="Leave an encouraging message for the project creator..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-gray-400"
          />
          <p className="text-right text-xs text-gray-400">{message.length}/200</p>
        </div>

        {/* Anonymity toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            role="switch"
            aria-checked={anonymous}
            tabIndex={0}
            onClick={() => setAnonymous((v) => !v)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setAnonymous((v) => !v); }}
            className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
              ${anonymous ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
                ${anonymous ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </div>
          <span className="text-sm text-gray-700">Donate anonymously</span>
        </label>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          isLoading={isSubmitting}
          disabled={!amount || amount <= 0}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Heart className="w-4 h-4" />
          Donate Now
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default DonationModal;
