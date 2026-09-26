import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Input, Spinner } from '@/components/ui'
import { http } from '@/services'
import { useAuth } from '@/features/auth'
import { MultiStepListingWizard } from './MultiStepListingWizard'

export interface CreateArtworkListingFormProps {
  /** Callback after successful publish */
  onPublish?: (listingId: string) => void
  /** Pre-fill with existing data (for editing) */
  initialData?: {
    title?: string
    description?: string
    category?: string
    tags?: string[]
    price?: string
    asset?: string
    licenseTerms?: string
    images?: string[]
  }
}

export default function CreateArtworkListingForm({
  onPublish,
  initialData,
}: CreateArtworkListingFormProps) {
  const queryClient = useQueryClient()
  const [showWizard, setShowWizard] = useState(true)

  const handlePublish = (listingId: string) => {
    queryClient.invalidateQueries({ queryKey: ['myListings'] })
    onPublish?.(listingId)
    setShowWizard(false)
  }

  const handleSaveDraft = (listingId: string) => {
    queryClient.invalidateQueries({ queryKey: ['myListings'] })
    // Stay on page to continue editing
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      {showWizard ? (
        <MultiStepListingWizard
          initialData={initialData}
          onPublish={handlePublish}
          onSaveDraft={handleSaveDraft}
        />
      ) : (
        <div className="rounded-card border border-line bg-surface p-12 shadow-card text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
            <svg className="h-8 w-8 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-h2">Listing Published!</h1>
          <p className="mt-2 text-caption text-muted">
            Your artwork is now live on the marketplace.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <a href="/artist/listings">View My Listings</a>
            </Button>
            <Button variant="secondary" onClick={() => setShowWizard(true)}>
              Create Another
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}