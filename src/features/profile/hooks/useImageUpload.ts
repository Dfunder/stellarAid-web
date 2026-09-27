import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadProfileImage } from '../services/imageUploadService'
import type { CropAspect } from '@/components/ImageUpload'

interface UseImageUploadOptions {
  /** Type of image being uploaded */
  imageType: 'avatar' | 'cover'
  /** Called when upload completes successfully with the new URL */
  onSuccess?: (imageUrl: string) => void
  /** Called when upload fails */
  onError?: (error: Error) => void
}

interface UploadState {
  isUploading: boolean
  progress: number
  error: string | null
}

export function useImageUpload({ imageType, onSuccess, onError }: UseImageUploadOptions) {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  })
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploadState({ isUploading: true, progress: 0, error: null })

      const imageUrl = await uploadProfileImage(
        file,
        imageType,
        (progress) => {
          setUploadState((prev) => ({ ...prev, progress }))
        }
      )

      return imageUrl
    },
    onSuccess: (imageUrl) => {
      setUploadState({ isUploading: false, progress: 100, error: null })
      onSuccess?.(imageUrl)
      // Invalidate profile queries to reflect the change
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setUploadState({ isUploading: false, progress: 0, error: errorMessage })
      onError?.(error)
    },
  })

  const upload = useCallback((file: File) => {
    uploadMutation.mutate(file)
  }, [uploadMutation])

  const reset = useCallback(() => {
    setUploadState({ isUploading: false, progress: 0, error: null })
  }, [])

  return {
    upload,
    reset,
    ...uploadState,
  }
}

/**
 * Hook that combines image upload with cropping functionality
 */
export function useImageUploadWithCrop({ imageType, onSuccess, onError }: UseImageUploadOptions) {
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const upload = useImageUpload({ imageType, onSuccess, onError })

  const handleFileSelect = useCallback((file: File) => {
    setPendingFile(file)
    setCropModalOpen(true)
  }, [])

  const handleCropComplete = useCallback((croppedFile: File) => {
    setCropModalOpen(false)
    setPendingFile(null)
    upload.upload(croppedFile)
  }, [upload])

  const handleCropCancel = useCallback(() => {
    setCropModalOpen(false)
    setPendingFile(null)
  }, [])

  const getAspect = useCallback((): CropAspect => {
    return imageType === 'avatar' ? 'square' : 'cover'
  }, [imageType])

  return {
    handleFileSelect,
    handleCropComplete,
    handleCropCancel,
    cropModalOpen,
    pendingFile,
    aspect: getAspect(),
    ...upload,
  }
}
