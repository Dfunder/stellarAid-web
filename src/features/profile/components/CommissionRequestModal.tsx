import { useState, type FormEvent } from 'react'
import { Button, Modal } from '@/components/ui'
import type { ArtistProfileExtended, ArtistServicePackage } from '../types'

export interface CommissionRequestModalProps {
  isOpen: boolean
  onClose: () => void
  profile: ArtistProfileExtended
  selectedService?: ArtistServicePackage | null
}

export default function CommissionRequestModal({
  isOpen,
  onClose,
  profile,
  selectedService,
}: CommissionRequestModalProps) {
  const [brief, setBrief] = useState('')
  const [budget, setBudget] = useState(
    selectedService ? selectedService.startingPrice.amount : '250',
  )
  const [deadline, setDeadline] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
    }, 600)
  }

  const handleReset = () => {
    setSubmitted(false)
    setBrief('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={submitted ? 'Commission Brief Sent!' : `Hire ${profile.displayName}`}
      description={
        submitted
          ? 'The creator will review your project brief and respond with an on-chain escrow proposal.'
          : selectedService
            ? `Package: ${selectedService.title} (Starting at ${selectedService.startingPrice.amount} ${selectedService.startingPrice.asset.code})`
            : 'Describe your vision, budget in XLM, and expected deadline.'
      }
    >
      {submitted ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-body font-semibold text-foreground">
            Request submitted successfully
          </p>
          <p className="text-caption text-muted">
            You will receive a notification once {profile.displayName} accepts your commission.
          </p>
          <Button onClick={handleReset} className="mt-2">
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-caption-sm font-semibold">
            Project Brief *
            <textarea
              required
              rows={4}
              placeholder="Explain the project scope, required formats, character descriptions or references..."
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              className="rounded-control border border-line bg-surface p-3 text-body text-foreground focus-visible:shadow-focus-ring"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-caption-sm font-semibold">
              Proposed Budget (XLM) *
              <input
                type="number"
                min="10"
                step="1"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="rounded-control border border-line bg-surface px-3 py-2 text-body text-foreground focus-visible:shadow-focus-ring"
              />
            </label>

            <label className="flex flex-col gap-1 text-caption-sm font-semibold">
              Target Deadline (Optional)
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="rounded-control border border-line bg-surface px-3 py-2 text-body text-foreground focus-visible:shadow-focus-ring"
              />
            </label>
          </div>

          <div className="rounded-control bg-surface-muted p-3 text-caption-sm text-muted">
            🔒 Payments on Lumora are secured via Stellar escrow smart contracts. Funds are only released when you approve completed milestones.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={handleReset}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} disabled={!brief.trim()}>
              Send Commission Request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
