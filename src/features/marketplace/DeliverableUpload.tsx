import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Input, Modal, Spinner } from '@/components/ui'
import { http } from '@/services'
import { useAuth } from '@/features/auth'

export type DeliverableKind = 'wip' | 'final'

export interface DeliverableFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed'
  progress: number
  error?: string
  /** WIP uploads are work-in-progress; finals are the deliverable. */
  kind: DeliverableKind
  /** Revision round this file belongs to, stacked per submission. */
  revision: number
  note?: string
}

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
] as const

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB
const MAX_FILES = 20

/** Default revision budget when the caller does not supply one. */
const DEFAULT_MAX_REVISIONS = 3

const PREVIEWABLE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(1)} ${units[unit]}`
}

interface DeliverableUploadProps {
  /** Artwork/listing ID */
  listingId: string
  /** Commission this submission belongs to; required to submit for review. */
  commissionId?: string
  /** Revision budget, surfaced before the artist submits. */
  maxRevisions?: number
  /** Revision round to upload into. */
  revision?: number
  /** Callback when all uploads complete */
  onComplete?: (files: DeliverableFile[]) => void
  /** Callback after a successful submit-for-review. */
  onSubmitForReview?: (revision: number) => void
  /** Initial files (for editing) */
  initialFiles?: DeliverableFile[]
}

export default function DeliverableUpload({
  listingId,
  commissionId,
  maxRevisions = DEFAULT_MAX_REVISIONS,
  revision = 1,
  onComplete,
  onSubmitForReview,
  initialFiles = [],
}: DeliverableUploadProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [files, setFiles] = useState<DeliverableFile[]>(initialFiles)
  const [dragActive, setDragActive] = useState(false)
  const [kind, setKind] = useState<DeliverableKind>('wip')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const uploadMutation = useMutation({
    mutationFn: async (file: DeliverableFile) => {
      // Get presigned URL
      const { uploadUrl, fileId } = await http.post<{ uploadUrl: string; fileId: string }>(
        `/listings/${listingId}/deliverables/presigned-url`,
        { fileName: file.name, fileType: file.type, fileSize: file.size }
      )

      // Update status to uploading
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, uploadStatus: 'uploading', progress: 0 } : f))
      )

      // Upload to presigned URL with progress
      await uploadToPresignedUrl(uploadUrl, file, (progress) => {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
        )
      })

      // Confirm upload
      await http.post(`/listings/${listingId}/deliverables/${fileId}/confirm`)

      return fileId
    },
    onSuccess: (fileId, file) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, uploadStatus: 'completed', progress: 100 } : f
        )
      )
      queryClient.invalidateQueries({ queryKey: ['deliverables', listingId] })
    },
    onError: (error, file) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id
            ? { ...f, uploadStatus: 'failed', error: error instanceof Error ? error.message : 'Upload failed' }
            : f
        )
      )
    },
  })

  const uploadToPresignedUrl = (
    url: string,
    file: DeliverableFile,
    onProgress: (progress: number) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      })
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })
      xhr.addEventListener('error', () => reject(new Error('Upload failed')))
      xhr.addEventListener('abort', () => reject(new Error('Upload aborted')))
      xhr.open('PUT', url)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.send(file as unknown as File)
    })
  }

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type as typeof ALLOWED_TYPES[number])) {
      return `File type "${file.type}" is not allowed. Allowed: images, PDF, ZIP, video, audio.`
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" exceeds maximum size of 500MB.`
    }
    return null
  }

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles)
      const validFiles: DeliverableFile[] = []
      const errors: string[] = []

      if (files.length + fileArray.length > MAX_FILES) {
        errors.push(`Maximum ${MAX_FILES} files allowed.`)
        fileArray.splice(MAX_FILES - files.length)
      }

      fileArray.forEach((file) => {
        const error = validateFile(file)
        if (error) {
          errors.push(error)
        } else {
          validFiles.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            url: '',
            uploadStatus: 'pending',
            progress: 0,
            kind,
            revision,
            note: note.trim() || undefined,
          })
        }
      })

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles])
        // Auto-upload
        validFiles.forEach((f) => uploadMutation.mutate(f))
      }

      if (errors.length > 0) {
        alert(errors.join('\n'))
      }
    },
    [files.length, listingId, uploadMutation, kind, revision, note]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const retryUpload = useCallback((file: DeliverableFile) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, uploadStatus: 'pending', progress: 0, error: undefined } : f))
    )
    uploadMutation.mutate(file)
  }, [uploadMutation])

  const completedFiles = files.filter((f) => f.uploadStatus === 'completed')
  const hasPendingUploads = files.some((f) => f.uploadStatus === 'pending' || f.uploadStatus === 'uploading')

  const revisionExhausted = revision > maxRevisions
  const finalsThisRevision = completedFiles.filter((f) => f.kind === 'final' && f.revision === revision)
  const canSubmit =
    !!commissionId && !revisionExhausted && !hasPendingUploads && finalsThisRevision.length > 0 && !submitting

  // Status transition itself is enforced by the backend; this only reports intent.
  const handleSubmitForReview = useCallback(async () => {
    if (!commissionId || !canSubmit) return
    setSubmitting(true)
    try {
      await http.post(`/commissions/${commissionId}/deliverables/submit`, {
        revision,
        note: note.trim() || undefined,
        fileIds: finalsThisRevision.map((f) => f.id),
      })
      queryClient.invalidateQueries({ queryKey: ['commission', commissionId] })
      onSubmitForReview?.(revision)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Submit for review failed')
    } finally {
      setSubmitting(false)
    }
  }, [commissionId, canSubmit, revision, note, finalsThisRevision, queryClient, onSubmitForReview])

  return (
    <div className="rounded-card border border-line bg-surface p-6 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-h3">Digital Deliverables</h2>
          <p className="mt-1 text-caption text-muted">
            Upload source files, high-res exports, and other assets buyers receive after purchase.
            Max {MAX_FILES} files, 500MB each.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => document.getElementById('file-input')?.click()}
          disabled={files.length >= MAX_FILES}
        >
          Add Files
        </Button>
      </div>

      <input
        id="file-input"
        type="file"
        multiple
        accept={ALLOWED_TYPES.join(',')}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />

      <div className="mt-4 flex flex-col gap-3 rounded-card border border-line bg-surface-muted p-4 sm:flex-row sm:items-end">
        <label className="flex flex-col gap-1.5">
          <span className="text-caption-sm font-medium text-foreground">Type</span>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as DeliverableKind)}
            className="rounded-control border border-line bg-surface px-3 py-2 text-caption-sm text-foreground"
          >
            <option value="wip">Work in progress</option>
            <option value="final">Final deliverable</option>
          </select>
        </label>

        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-caption-sm font-medium text-foreground">Note for this upload</span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What changed in this revision?"
            className="rounded-control border border-line bg-surface px-3 py-2 text-caption-sm text-foreground"
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-caption-sm font-medium text-foreground">Revision</span>
          <span
            className={`rounded-control px-3 py-2 text-caption-sm font-semibold ${
              revisionExhausted ? 'bg-danger/10 text-danger' : 'bg-surface text-foreground'
            }`}
          >
            {revision} of {maxRevisions}
          </span>
        </div>
      </div>

      {commissionId && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-caption-sm text-muted">
            {revisionExhausted
              ? `Revision budget of ${maxRevisions} used up. Contact support to request another round.`
              : finalsThisRevision.length === 0
              ? 'Add at least one final deliverable before submitting for review.'
              : `${finalsThisRevision.length} final file(s) ready for review.`}
          </p>
          <Button variant="primary" onClick={handleSubmitForReview} disabled={!canSubmit}>
            {submitting ? 'Submitting…' : `Submit revision ${revision} for review`}
          </Button>
        </div>
      )}

      <div
        className={`mt-4 rounded-card border-2 border-dashed transition-colors p-8 text-center ${
          dragActive ? 'border-primary bg-primary/5' : 'border-line hover:border-primary/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            document.getElementById('file-input')?.click()
          }
        }}
      >
        <svg className="h-12 w-12 mx-auto text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="mt-3 text-caption text-muted">
          {dragActive ? 'Drop files here…' : 'Drag & drop files here, or click to browse'}
        </p>
        <p className="mt-1 text-caption-xs text-muted">
          Images, PDF, ZIP, video, audio — up to 500MB each
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-caption-sm font-semibold text-foreground">
            Files ({completedFiles.length} uploaded, {files.length - completedFiles.length} pending)
          </h3>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-card ${
                  file.uploadStatus === 'failed' ? 'border-danger/30 bg-danger/5' : 'border border-line bg-surface-muted'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* WIP and finals stay visually distinguishable in the list. */}
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-caption-xs font-semibold ${
                      file.kind === 'final' ? 'bg-success/10 text-success' : 'bg-line text-muted'
                    }`}
                  >
                    {file.kind === 'final' ? 'Final' : 'WIP'}
                    {file.revision > 1 ? ` · r${file.revision}` : ''}
                  </span>
                  <div
                    className={`h-8 w-8 rounded flex items-center justify-center flex-shrink-0 ${
                      file.uploadStatus === 'completed'
                        ? 'bg-success/10 text-success'
                        : file.uploadStatus === 'failed'
                        ? 'bg-danger/10 text-danger'
                        : 'bg-line text-muted'
                    }`}
                  >
                    {file.uploadStatus === 'completed' ? (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : file.uploadStatus === 'failed' ? (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    ) : file.uploadStatus === 'uploading' ? (
                      <Spinner className="h-5 w-5" />
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-caption font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-caption-xs text-muted">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:w-48">
                  {file.uploadStatus === 'uploading' && (
                    <div className="flex-1 h-1.5 bg-line rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <span className="text-caption-xs text-muted w-10 text-right">{file.progress}%</span>
                  )}
                  {file.uploadStatus === 'completed' && (
                    <span className="text-caption-xs text-success">Uploaded</span>
                  )}
                  {file.uploadStatus === 'failed' && (
                    <>
                      <span className="text-caption-xs text-danger flex-1 text-right">{file.error}</span>
                      <Button size="sm" variant="ghost" onClick={() => retryUpload(file)}>
                        Retry
                      </Button>
                    </>
                  )}
                  {file.uploadStatus === 'pending' && (
                    <Button size="sm" onClick={() => uploadMutation.mutate(file)}>
                      Upload
                    </Button>
                  )}
                  <button
                    type="button"
                    className="text-muted hover:text-danger p-1"
                    onClick={() => removeFile(file.id)}
                    disabled={file.uploadStatus === 'uploading'}
                    aria-label="Remove file"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {hasPendingUploads && (
            <div className="flex items-center gap-2 text-caption-sm text-muted">
              <Spinner className="h-4 w-4" />
              <span>Uploading {files.filter((f) => f.uploadStatus === 'uploading').length} file(s)…</span>
            </div>
          )}

          {completedFiles.length > 0 && !hasPendingUploads && (
            <p className="text-caption text-success">All files uploaded successfully!</p>
          )}
        </div>
      )}

      {files.length > 0 && onComplete && (
        <Button className="mt-4" variant="secondary" onClick={() => onComplete(completedFiles)} disabled={hasPendingUploads}>
          Done
        </Button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Client-side review and acceptance (#725)
// ---------------------------------------------------------------------------

export interface DeliverableReviewPanelProps {
  commissionId: string
  /** Deliverables submitted for the current revision. */
  deliverables: DeliverableFile[]
  /** Revision currently under review. */
  revision: number
  /** Revision budget for this commission. */
  maxRevisions?: number
  /** Set false once only acceptance is left. */
  canRequestChanges?: boolean
  onAccepted?: () => void
}

export function DeliverableReviewPanel({
  commissionId,
  deliverables,
  revision,
  maxRevisions = DEFAULT_MAX_REVISIONS,
  canRequestChanges = true,
  onAccepted,
}: DeliverableReviewPanelProps) {
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState<'changes' | 'accept' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const revisionsLeft = Math.max(0, maxRevisions - revision)

  async function run(action: 'changes' | 'accept') {
    setBusy(action)
    setError(null)
    try {
      if (action === 'changes') {
        await http.post(`/commissions/${commissionId}/revisions`, { feedback: feedback.trim() })
      } else {
        // The backend/contract performs the actual escrow release.
        await http.post(`/commissions/${commissionId}/accept`, { revision })
        onAccepted?.()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="rounded-card border border-line bg-surface p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-h3">Review deliverables</h2>
          <p className="mt-1 text-caption text-muted">
            Revision {revision} · {revisionsLeft} of {maxRevisions} revisions remaining
          </p>
        </div>
      </div>

      {/* Max-revision policy is surfaced before the accept action, not after. */}
      {revisionsLeft === 0 && (
        <div className="mt-4 rounded-control bg-warning/10 p-4">
          <p className="text-caption text-warning">
            This commission has used its full revision budget of {maxRevisions}. Requesting further changes
            is no longer possible — accept the work or open a dispute.
          </p>
        </div>
      )}

      {deliverables.length === 0 ? (
        <p className="mt-4 text-caption text-muted">Nothing has been submitted for this revision yet.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {deliverables.map((file) => (
            <li
              key={file.id}
              className="flex flex-col gap-3 rounded-card border border-line bg-surface-muted p-4 sm:flex-row sm:items-center"
            >
              {PREVIEWABLE_TYPES.includes(file.type) && file.url ? (
                <img src={file.url} alt={file.name} className="h-16 w-16 rounded object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded bg-line text-muted">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
              )}

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="truncate text-caption font-medium text-foreground">{file.name}</p>
                <p className="text-caption-xs text-muted">
                  {formatBytes(file.size)}
                  {file.note ? ` · ${file.note}` : ''}
                </p>
              </div>

              <a
                href={file.url}
                download={file.name}
                className="rounded-control border border-line px-3 py-1.5 text-caption-sm font-semibold text-foreground hover:bg-surface"
              >
                Download
              </a>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex flex-col gap-4 border-t border-line pt-6">
        {canRequestChanges && revisionsLeft > 0 && (
          <label className="flex flex-col gap-1.5">
            <span className="text-caption-sm font-medium text-foreground">Feedback for the artist</span>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              placeholder="What needs to change?"
              className="rounded-control border border-line bg-surface-muted px-3 py-2 text-caption-sm text-foreground"
            ></textarea>
          </label>
        )}

        {error && (
          <p role="alert" className="text-caption text-danger">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          {canRequestChanges && revisionsLeft > 0 && (
            <Button
              variant="secondary"
              onClick={() => run('changes')}
              disabled={busy !== null || feedback.trim().length === 0}
            >
              {busy === 'changes' ? 'Sending…' : 'Request changes'}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() => run('accept')}
            disabled={busy !== null || deliverables.length === 0}
          >
            {busy === 'accept' ? 'Accepting…' : 'Accept & release payment'}
          </Button>
        </div>
      </div>
    </div>
  )
}
