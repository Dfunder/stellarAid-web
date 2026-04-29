'use client';

import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, Button } from '@/components/ui';
import { CheckCircle2, Clock, ExternalLink, Share2, LayoutDashboard } from 'lucide-react';

export interface SubmissionSuccessModalProps {
  isOpen: boolean;
  projectId?: string;
  projectTitle?: string;
  onViewProject?: () => void;
  onGoToDashboard?: () => void;
}

const REDIRECT_DELAY_MS = 8_000;

const NEXT_STEPS = [
  { icon: '🔍', title: 'Under review', description: 'Our team will review your project within 24–48 hours.' },
  { icon: '📧', title: 'Email confirmation', description: "You'll receive a confirmation at your registered email." },
  { icon: '✅', title: 'Approval & live', description: 'Once approved, your campaign goes live and can receive donations.' },
];

export function SubmissionSuccessModal({
  isOpen,
  projectId,
  projectTitle,
  onViewProject,
  onGoToDashboard,
}: SubmissionSuccessModalProps) {
  const [countdown, setCountdown] = useState(REDIRECT_DELAY_MS / 1000);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(REDIRECT_DELAY_MS / 1000);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onGoToDashboard?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onGoToDashboard]);

  async function handleShare() {
    const url = projectId ? `${window.location.origin}/projects/${projectId}` : window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: projectTitle ?? 'My StellarAid Project', url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // user cancelled share — ignore
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onGoToDashboard?.()}
      variant="centered"
      size="md"
      showCloseButton={false}
      closeOnOverlayClick={false}
      aria-labelledby="success-modal-title"
    >
      <ModalBody className="text-center space-y-6 py-8">
        {/* Celebratory icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
        </div>

        {/* Heading */}
        <div>
          <h2 id="success-modal-title" className="text-2xl font-bold text-gray-900">
            Campaign Submitted! 🎉
          </h2>
          {projectTitle && (
            <p className="mt-1 text-gray-500 text-sm font-medium truncate px-4">
              &quot;{projectTitle}&quot;
            </p>
          )}
          <p className="mt-3 text-gray-600 text-sm leading-relaxed">
            Your project has been submitted for review. You&apos;ll hear back within{' '}
            <strong>24–48 hours</strong>.
          </p>
        </div>

        {/* Review timeline */}
        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <p className="text-sm font-semibold text-gray-700">What happens next</p>
          </div>
          {NEXT_STEPS.map((step) => (
            <div key={step.title} className="flex items-start gap-3">
              <span className="text-lg leading-none mt-0.5">{step.icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-800">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {projectId && (
            <Button
              variant="outline"
              onClick={onViewProject}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Project
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            {copied ? 'Link Copied!' : 'Share Project'}
          </Button>
          <Button
            onClick={onGoToDashboard}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Button>
        </div>

        {/* Auto-redirect notice */}
        <p className="text-xs text-gray-400">
          Redirecting to dashboard in {countdown}s…
        </p>
      </ModalBody>
    </Modal>
  );
}

export default SubmissionSuccessModal;
