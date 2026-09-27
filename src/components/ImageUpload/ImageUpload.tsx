import { useState, useCallback, useRef } from 'react'
import { Spinner } from '@/components/ui'

interface ImageUploadProps {
  /** Current image URL to display */
  currentImage?: string | null
  /** Label for the upload area */
  label: string
  /** Hint text explaining requirements */
  hint?: string
  /** Maximum file size in bytes (default: 10MB) */
  maxSize?: number
  /** Allowed MIME types (default: common image formats) */
  acceptedTypes?: string[]
  /** Called when a file is selected and validated */
  onFileSelect: (file: File) => void
  /** Called when current image is removed */
  onRemove?: () => void
  /** Whether upload is in progress */
  isUploading?: boolean
  /** Upload progress percentage (0-100) */
  uploadProgress?: number
  /** Error message to display */
  error?: string | null
  /** Disabled state */
  disabled?: boolean
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB
const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export default function ImageUpload({
  currentImage,
  label,
  hint,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  onFileSelect,
  onRemove,
  isUploading = false,
  uploadProgress = 0,
  error = null,
  disabled = false,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type "${file.type}" is not allowed. Accepted: ${acceptedTypes.join(', ')}`
    }
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
      return `File size exceeds maximum of ${maxSizeMB}MB`
    }
    return null
  }

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      if (fileArray.length === 0) return

      const file = fileArray[0]!
      const validationError = validateFile(file)

      if (validationError) {
        alert(validationError)
        return
      }

      onFileSelect(file)
    },
    [acceptedTypes, maxSize, onFileSelect]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      if (!disabled) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [disabled, handleFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setDragActive(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files)
      }
    },
    [handleFiles]
  )

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click()
    }
  }, [disabled, isUploading])

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onRemove?.()
    },
    [onRemove]
  )

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-caption-sm font-semibold text-foreground">{label}</label>
        {currentImage && onRemove && !isUploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-caption-sm text-danger hover:text-danger/80"
          >
            Remove
          </button>
        )}
      </div>

      {/* Upload Zone */}
      <div
        className={`relative rounded-card border-2 border-dashed transition-all overflow-hidden ${
          dragActive
            ? 'border-primary bg-primary/5'
            : error
              ? 'border-danger bg-danger/5'
              : 'border-line hover:border-primary/50 bg-surface-muted'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isUploading) {
            e.preventDefault()
            fileInputRef.current?.click()
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {/* Current Image Display */}
        {currentImage && !isUploading ? (
          <div className="relative">
            <img
              src={currentImage}
              alt="Current upload"
              className="w-full h-48 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-caption font-medium text-white">Click to change</span>
            </div>
          </div>
        ) : (
          /* Upload Placeholder */
          <div className="p-8 text-center">
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Spinner className="h-8 w-8" />
                <div className="w-full max-w-xs">
                  <div className="h-2 bg-line rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-caption-sm text-muted">Uploading... {uploadProgress}%</p>
                </div>
              </div>
            ) : (
              <>
                <svg
                  className="h-12 w-12 mx-auto text-muted"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="mt-3 text-caption text-muted">
                  {dragActive ? 'Drop image here…' : 'Drag & drop an image, or click to browse'}
                </p>
                {hint && <p className="mt-1 text-caption-xs text-muted">{hint}</p>}
              </>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-caption-sm text-danger flex items-center gap-1">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}

      {/* File Requirements */}
      <p className="text-caption-xs text-muted">
        Max size: {formatFileSize(maxSize)} • Formats: {acceptedTypes.map((t) => t.split('/')[1]).join(', ')}
      </p>
    </div>
  )
}
