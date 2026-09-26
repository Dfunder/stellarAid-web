import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, ExplorerLink, Input, Modal, Spinner } from '@/components/ui'
import { http } from '@/services'
import { useAuth } from '@/features/auth'
import { formatDate } from '@/lib'
import { z } from 'zod'

const ListingSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(20).max(5000),
  category: z.string().min(1),
  tags: z.array(z.string()).max(10),
  price: z.string().regex(/^\d+(\.\d{1,7})?$/),
  asset: z.enum(['XLM', 'USDC', 'NGNT', 'EURC']),
  licenseTerms: z.string().max(10000),
  images: z.array(z.string().url()).min(1).max(10),
})

type ListingFormData = z.infer<typeof ListingSchema>

interface Listing {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  price: string
  asset: string
  licenseTerms: string
  images: string[]
  status: 'draft' | 'active' | 'sold' | 'unpublished'
  createdAt: string
  updatedAt: string
  hasPendingOffers: boolean
}

const CATEGORIES = [
  'Digital Art',
  'Illustration',
  '3D Models',
  'Photography',
  'Animation',
  'Music',
  'Writing',
  'Other',
] as const

const LICENSE_PRESETS = [
  { value: 'personal', label: 'Personal Use', description: 'For personal, non-commercial use only' },
  { value: 'commercial', label: 'Commercial Use', description: 'Allows commercial use with attribution' },
  { value: 'exclusive', label: 'Exclusive Rights', description: 'Full exclusive rights, artwork removed from marketplace' },
] as const

export default function EditListing({ listingId }: { listingId: string }) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<Partial<ListingFormData>>({})
  const [errors, setErrors] = useState<Partial<Record<keyof ListingFormData, string>>>({})
  const [activeStep, setActiveStep] = useState(0)
  const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const { data: listing, isPending, isError, error, refetch } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async (): Promise<Listing> => (await http.get<{ listing: Listing }>(`/listings/${listingId}`)).listing,
    enabled: !!listingId,
  })

  const updateMutation = useMutation({
    mutationFn: (data: ListingFormData) => http.patch(`/listings/${listingId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] })
      queryClient.invalidateQueries({ queryKey: ['myListings'] })
    },
  })

  const publishMutation = useMutation({
    mutationFn: () => http.patch(`/listings/${listingId}`, { status: 'active' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] })
      queryClient.invalidateQueries({ queryKey: ['myListings'] })
    },
  })

  const unpublishMutation = useMutation({
    mutationFn: () => http.patch(`/listings/${listingId}`, { status: 'unpublished' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] })
      queryClient.invalidateQueries({ queryKey: ['myListings'] })
      setShowUnpublishConfirm(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => http.delete(`/listings/${listingId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myListings'] })
      setShowDeleteConfirm(false)
    },
  })

  // Initialize form with listing data
  useState(() => {
    if (listing) {
      setFormData({
        title: listing.title,
        description: listing.description,
        category: listing.category,
        tags: listing.tags,
        price: listing.price,
        asset: listing.asset as ListingFormData['asset'],
        licenseTerms: listing.licenseTerms,
        images: listing.images,
      })
    }
  })

  const steps = [
    { id: 0, label: 'Details', fields: ['title', 'description', 'category', 'tags'] },
    { id: 1, label: 'Media', fields: ['images'] },
    { id: 2, label: 'Pricing', fields: ['price', 'asset', 'licenseTerms'] },
    { id: 3, label: 'Review', fields: [] },
  ]

  const validateStep = (step: number): boolean => {
    const stepFields = steps[step].fields
    const newErrors: Partial<Record<keyof ListingFormData, string>> = {}
    let isValid = true

    stepFields.forEach((field) => {
      try {
        const fieldSchema = ListingSchema.shape[field]
        if (fieldSchema) {
          fieldSchema.parse(formData[field as keyof ListingFormData])
        }
      } catch (err) {
        if (err instanceof z.ZodError) {
          newErrors[field as keyof ListingFormData] = err.errors[0].message
          isValid = false
        }
      }
    })

    setErrors((prev) => ({ ...prev, ...newErrors }))
    return isValid
  }

  const validateAll = (): boolean => {
    try {
      ListingSchema.parse(formData)
      setErrors({})
      return true
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof ListingFormData, string>> = {}
        err.errors.forEach((e) => {
          if (e.path[0]) newErrors[e.path[0] as keyof ListingFormData] = e.message
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((s) => Math.min(s + 1, steps.length - 1))
    }
  }

  const handleBack = () => {
    setActiveStep((s) => Math.max(s - 1, 0))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateAll()) {
      await updateMutation.mutateAsync(formData as ListingFormData)
    }
  }

  const handlePublish = async () => {
    if (validateAll()) {
      setIsPublishing(true)
      await updateMutation.mutateAsync(formData as ListingFormData)
      await publishMutation.mutateAsync()
      setIsPublishing(false)
    }
  }

  if (isPending) {
    return (
      <div className="container py-12">
        <div className="flex items-center gap-3 py-8 text-muted">
          <Spinner label="Loading listing" className="h-5 w-5" />
          <span className="text-caption">Loading listing…</span>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container py-12">
        <div className="flex flex-wrap items-center gap-3 rounded-control bg-danger/10 p-4">
          <p role="alert" className="text-caption text-danger">
            {error instanceof Error ? error.message : 'Failed to load listing'}
          </p>
          <Button size="sm" variant="secondary" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      </div>
    )
  }

  if (!listing) return null

  const currentStep = steps[activeStep]
  const progress = ((activeStep + 1) / steps.length) * 100

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-h2">Edit Listing: {listing.title}</h1>
        <p className="mt-1 text-caption text-muted">
          {STATUS_LABELS[listing.status]} • Updated {formatDate(listing.updatedAt)}
        </p>
      </div>

      <div className="mb-6">
        <div className="h-2 bg-line rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-caption-xs text-muted">
          {steps.map((step, index) => (
            <span key={step.id} className={index <= activeStep ? 'text-foreground' : ''}>
              {step.label}
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeStep === 0 && (
          <div className="rounded-card border border-line bg-surface p-6 shadow-card space-y-6">
            <h2 className="text-h3">Details</h2>

            <div>
              <label htmlFor="title" className="block text-caption-sm font-medium text-foreground mb-1">
                Title *
              </label>
              <Input
                id="title"
                value={formData.title ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Artwork title"
                error={errors.title}
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-caption-sm font-medium text-foreground mb-1">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={6}
                className="w-full rounded-control border border-line bg-background px-3 py-2 text-caption-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="Describe your artwork..."
                maxLength={5000}
              />
              {errors.description && <p className="mt-1 text-caption-sm text-danger">{errors.description}</p>}
              <p className="mt-1 text-caption-xs text-muted">
                {formData.description?.length ?? 0}/5000 characters
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="category" className="block text-caption-sm font-medium text-foreground mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  value={formData.category ?? ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-control border border-line bg-background px-3 py-2 text-caption-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  error={errors.category}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tags" className="block text-caption-sm font-medium text-foreground mb-1">
                  Tags (comma-separated, max 10)
                </label>
                <Input
                  id="tags"
                  value={formData.tags?.join(', ') ?? ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }))}
                  placeholder="digital, portrait, sci-fi"
                  error={errors.tags}
                />
              </div>
            </div>
          </div>
        )}

        {activeStep === 1 && (
          <div className="rounded-card border border-line bg-surface p-6 shadow-card space-y-6">
            <h2 className="text-h3">Media</h2>
            <p className="text-caption text-muted">
              Upload up to 10 images. First image will be used as thumbnail.
            </p>

            <div className="flex flex-wrap gap-3">
              {(formData.images ?? []).map((image, index) => (
                <div key={index} className="relative group h-24 w-24 rounded-card overflow-hidden">
                  <img src={image} alt={`Image ${index + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-danger/90 text-danger-contrast opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setFormData((prev) => ({ ...prev, images: prev.images?.filter((_, i) => i !== index) ?? [] }))}
                  >
                    ×
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 rounded-full bg-primary/90 px-1.5 py-0.5 text-caption-xs text-primary-contrast">
                      Thumbnail
                    </span>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="h-24 w-24 rounded-card border-2 border-dashed border-line flex items-center justify-center text-muted hover:border-primary hover:text-primary transition-colors"
                disabled={(formData.images?.length ?? 0) >= 10}
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>

            {errors.images && <p className="text-caption-sm text-danger">{errors.images}</p>}
          </div>
        )}

        {activeStep === 2 && (
          <div className="rounded-card border border-line bg-surface p-6 shadow-card space-y-6">
            <h2 className="text-h3">Pricing & License</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="price" className="block text-caption-sm font-medium text-foreground mb-1">
                  Price *
                </label>
                <Input
                  id="price"
                  type="number"
                  step="0.0000001"
                  min="0.0000001"
                  value={formData.price ?? ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  error={errors.price}
                />
              </div>

              <div>
                <label htmlFor="asset" className="block text-caption-sm font-medium text-foreground mb-1">
                  Asset *
                </label>
                <select
                  id="asset"
                  value={formData.asset ?? ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, asset: e.target.value as ListingFormData['asset'] }))}
                  className="w-full rounded-control border border-line bg-background px-3 py-2 text-caption-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  error={errors.asset}
                >
                  <option value="">Select asset</option>
                  <option value="XLM">XLM (7 decimals)</option>
                  <option value="USDC">USDC (2 decimals)</option>
                  <option value="NGNT">NGNT (2 decimals)</option>
                  <option value="EURC">EURC (2 decimals)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-caption-sm font-medium text-foreground mb-2">
                License Terms *
              </label>
              <div className="mb-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="licensePreset"
                    checked={LICENSE_PRESETS.some((p) => p.value === formData.licenseTerms)}
                    onChange={() => {}}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-caption-sm">Use a preset</span>
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LICENSE_PRESETS.map((preset) => (
                    <label
                      key={preset.value}
                      className={`flex cursor-pointer items-center gap-2 rounded-control px-3 py-2 text-caption-sm transition-colors ${
                        formData.licenseTerms === preset.value
                          ? 'bg-primary/10 text-primary border border-primary'
                          : 'bg-surface-muted text-foreground hover:bg-surface border border-line'
                      }`}
                    >
                      <input
                        type="radio"
                        name="licensePreset"
                        value={preset.value}
                        checked={formData.licenseTerms === preset.value}
                        onChange={(e) => setFormData((prev) => ({ ...prev, licenseTerms: e.target.value }))}
                        className="h-4 w-4 accent-primary"
                      />
                      <span>{preset.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="licenseTerms" className="block text-caption-sm font-medium text-foreground mb-1">
                  Custom Terms (or edit preset)
                </label>
                <textarea
                  id="licenseTerms"
                  value={formData.licenseTerms ?? ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, licenseTerms: e.target.value }))}
                  rows={4}
                  className="w-full rounded-control border border-line bg-background px-3 py-2 text-caption-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="Enter custom license terms..."
                  maxLength={10000}
                />
                {errors.licenseTerms && <p className="mt-1 text-caption-sm text-danger">{errors.licenseTerms}</p>}
              </div>
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="rounded-card border border-line bg-surface p-6 shadow-card space-y-6">
            <h2 className="text-h3">Review & Publish</h2>
            <p className="text-caption text-muted">Review all details before saving or publishing.</p>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h4 className="text-caption-sm font-semibold text-muted">Details</h4>
                <dl className="mt-2 space-y-2 text-caption-sm">
                  <div className="flex justify-between"><dt className="text-muted">Title</dt><dd>{formData.title}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Category</dt><dd>{formData.category}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Tags</dt><dd>{formData.tags?.join(', ') ?? '—'}</dd></div>
                </dl>
              </div>
              <div>
                <h4 className="text-caption-sm font-semibold text-muted">Pricing & License</h4>
                <dl className="mt-2 space-y-2 text-caption-sm">
                  <div className="flex justify-between"><dt className="text-muted">Price</dt><dd>{formData.price} {formData.asset}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">License</dt><dd>{formData.licenseTerms.slice(0, 50)}…</dd></div>
                </dl>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-line">
              <Button type="button" variant="secondary" onClick={handleBack}>
                Back
              </Button>
              <Button type="submit" variant="secondary" isLoading={updateMutation.isPending}>
                Save as Draft
              </Button>
              <Button
                type="button"
                isLoading={isPublishing}
                disabled={listing.hasPendingOffers}
                onClick={handlePublish}
              >
                {listing.status === 'active' ? 'Save Changes' : 'Publish'}
              </Button>
              {listing.hasPendingOffers && (
                <span className="text-caption-xs text-warning ml-auto">Price changes blocked: pending offers exist</span>
              )}
            </div>
          </div>
        )}

        {activeStep < 3 && (
          <div className="flex justify-between">
            {activeStep > 0 && (
              <Button type="button" variant="secondary" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          </div>
        )}
      </form>

      {(listing.status === 'active' || listing.status === 'unpublished') && (
        <div className="mt-6 rounded-card border border-line bg-surface p-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-h3">Listing Actions</h3>
              <p className="mt-1 text-caption text-muted">
                {listing.status === 'active'
                  ? 'Unpublishing hides the listing from the marketplace but preserves order history.'
                  : 'Delete this draft permanently.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {listing.status === 'active' && (
                <Button variant="ghost" onClick={() => setShowUnpublishConfirm(true)}>
                  Unpublish
                </Button>
              )}
              {(listing.status === 'unpublished' || listing.status === 'draft') && (
                <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                  Delete Permanently
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={showUnpublishConfirm}
        onClose={() => setShowUnpublishConfirm(false)}
        title="Unpublish this listing?"
        description="The listing will be hidden from the marketplace. Existing orders are not affected. You can re-publish later."
      >
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowUnpublishConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={unpublishMutation.isPending} onClick={() => void unpublishMutation.mutate()}>
            Unpublish
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete this listing permanently?"
        description="This action cannot be undone. All draft data will be lost."
      >
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={deleteMutation.isPending} onClick={() => void deleteMutation.mutate()}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}

const STATUS_LABELS: Record<Listing['status'], string> = {
  draft: 'Draft',
  active: 'Active',
  sold: 'Sold',
  unpublished: 'Unpublished',
}