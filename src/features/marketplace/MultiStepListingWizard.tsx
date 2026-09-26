import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Input, Modal, Spinner } from '@/components/ui'
import { http } from '@/services'
import { useAuth } from '@/features/auth'
import { MultiAssetPricingInput, LicenseTermsField } from '.'
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

const STEPS = [
  { id: 0, label: 'Details', fields: ['title', 'description', 'category', 'tags'] },
  { id: 1, label: 'Media', fields: ['images'] },
  { id: 2, label: 'Pricing', fields: ['price', 'asset', 'licenseTerms'] },
  { id: 3, label: 'Review', fields: [] },
] as const

export interface MultiStepListingWizardProps {
  /** Initial data for editing existing listing */
  initialData?: Partial<ListingFormData>
  /** Callback on successful publish */
  onPublish?: (listingId: string) => void
  /** Callback on save draft */
  onSaveDraft?: (listingId: string) => void
}

export default function MultiStepListingWizard({
  initialData,
  onPublish,
  onSaveDraft,
}: MultiStepListingWizardProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<Partial<ListingFormData>>(initialData ?? {})
  const [errors, setErrors] = useState<Partial<Record<keyof ListingFormData, string>>>({})
  const [activeStep, setActiveStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draftId, setDraftId] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: (data: ListingFormData) => http.post<{ listing: { id: string } }>('/listings', data),
    onSuccess: (response) => {
      const id = response.listing.id
      setDraftId(id)
      queryClient.invalidateQueries({ queryKey: ['myListings'] })
      onPublish?.(id)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ListingFormData }) => http.patch(`/listings/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['myListings'] })
      queryClient.invalidateQueries({ queryKey: ['listing', id] })
      onPublish?.(id)
    },
  })

  const saveDraftMutation = useMutation({
    mutationFn: (data: ListingFormData) => http.post<{ listing: { id: string } }>('/listings/draft', data),
    onSuccess: (response) => {
      const id = response.listing.id
      setDraftId(id)
      queryClient.invalidateQueries({ queryKey: ['myListings'] })
      onSaveDraft?.(id)
    },
  })

  const updateDraftMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ListingFormData }) => http.patch(`/listings/draft/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['myListings'] })
      queryClient.invalidateQueries({ queryKey: ['listing', id] })
      onSaveDraft?.(id)
    },
  })

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeStep > 0 && (draftId || !isSubmitting)) {
        const dataToSave = { ...formData, status: 'draft' } as ListingFormData
        if (draftId) {
          updateDraftMutation.mutate({ id: draftId, data: dataToSave })
        } else {
          saveDraftMutation.mutate(dataToSave)
        }
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [formData, activeStep, draftId])

  const validateStep = (step: number): boolean => {
    const stepFields = STEPS[step].fields
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
      setActiveStep((s) => Math.min(s + 1, STEPS.length - 1))
    }
  }

  const handleBack = () => {
    setActiveStep((s) => Math.max(s - 1, 0))
  }

  const handleSubmit = async (publish: boolean) => {
    if (!validateAll()) return
    setIsSubmitting(true)
    try {
      const data = formData as ListingFormData
      if (publish) {
        if (draftId) {
          await updateMutation.mutateAsync({ id: draftId, data: { ...data, status: 'active' } })
        } else {
          await createMutation.mutateAsync({ ...data, status: 'active' })
        }
      } else {
        if (draftId) {
          await updateDraftMutation.mutateAsync({ id: draftId, data: { ...data, status: 'draft' } })
        } else {
          await saveDraftMutation.mutateAsync({ ...data, status: 'draft' })
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = ((activeStep + 1) / STEPS.length) * 100

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-h2">{initialData ? 'Edit Listing' : 'Create New Listing'}</h1>
        <p className="mt-1 text-caption text-muted">
          {STEPS[activeStep].label} — Step {activeStep + 1} of {STEPS.length}
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
          {STEPS.map((step, index) => (
            <span
              key={step.id}
              className={`${index <= activeStep ? 'text-foreground' : ''} ${
                index === activeStep ? 'font-semibold' : ''
              }`}
            >
              {step.label}
            </span>
          ))}
        </div>
      </div>

      <form className="space-y-6">
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
                placeholder="Describe your artwork in detail..."
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
              Upload up to 10 images. First image will be used as thumbnail. Drag to reorder.
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
                onClick={() => document.getElementById('wizard-file-input')?.click()}
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>

            <input
              id="wizard-file-input"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? [])
                const newImages = files.map((f) => URL.createObjectURL(f))
                setFormData((prev) => ({ ...prev, images: [...(prev.images ?? []), ...newImages] }))
              }}
              className="hidden"
            />

            {errors.images && <p className="text-caption-sm text-danger">{errors.images}</p>}
          </div>
        )}

        {activeStep === 2 && (
          <div className="rounded-card border border-line bg-surface p-6 shadow-card space-y-6">
            <h2 className="text-h3">Pricing & License</h2>

            <MultiAssetPricingInput
              value={formData.price ?? ''}
              onChange={(v) => setFormData((prev) => ({ ...prev, price: v }))}
              asset={formData.asset ?? 'XLM'}
              onAssetChange={(a) => setFormData((prev) => ({ ...prev, asset: a }))}
              error={errors.price}
            />

            <LicenseTermsField
              value={formData.licenseTerms ?? ''}
              onChange={(v) => setFormData((prev) => ({ ...prev, licenseTerms: v }))}
              error={errors.licenseTerms}
            />
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
                  <div className="flex justify-between"><dt className="text-muted">License</dt><dd>{formData.licenseTerms?.slice(0, 50)}…</dd></div>
                </dl>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-line">
              <Button type="button" variant="secondary" onClick={handleBack}>
                Back
              </Button>
              <Button
                type="button"
                variant="secondary"
                isLoading={isSubmitting || saveDraftMutation.isPending || updateDraftMutation.isPending}
                onClick={() => handleSubmit(false)}
              >
                Save as Draft
              </Button>
              <Button
                type="button"
                isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending}
                onClick={() => handleSubmit(true)}
              >
                Publish
              </Button>
            </div>
          </div>
        )}

        {activeStep < 3 && activeStep > 0 && (
          <div className="flex justify-between">
            <Button type="button" variant="secondary" onClick={handleBack}>
              Back
            </Button>
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          </div>
        )}
      </form>

      <Modal
        isOpen={createMutation.isError || updateMutation.isError || saveDraftMutation.isError || updateDraftMutation.isError}
        onClose={() => {}}
        title="Error"
        description={createMutation.error?.message ?? updateMutation.error?.message ?? saveDraftMutation.error?.message ?? updateDraftMutation.error?.message ?? 'An error occurred'}
      >
        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={() => setErrors({})}>OK</Button>
        </div>
      </Modal>
    </div>
  )
}