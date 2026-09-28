import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Button, Modal, Spinner } from '@/components/ui'

export type CropAspect = 'square' | 'cover'

interface ImageCropModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Called when modal is closed */
  onClose: () => void
  /** Called when crop is confirmed with the cropped file */
  onCropComplete: (croppedFile: File) => void
  /** Image file to crop */
  imageFile: File
  /** Aspect ratio: 'square' for avatar (1:1), 'cover' for banner (16:9) */
  aspect: CropAspect
}

const ASPECT_RATIOS: Record<CropAspect, number> = {
  square: 1,
  cover: 16 / 9,
}

const ASPECT_LABELS: Record<CropAspect, string> = {
  square: 'Square (1:1)',
  cover: 'Wide (16:9)',
}

export default function ImageCropModal({
  isOpen,
  onClose,
  onCropComplete,
  imageFile,
  aspect,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [imageSrc, setImageSrc] = useState<string>('')

  // Load image when modal opens
  const loadImage = useCallback(() => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string)
    }
    reader.readAsDataURL(imageFile)
  }, [imageFile])

  // Reset state when modal opens
  const handleOpen = useCallback(() => {
    loadImage()
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setIsProcessing(false)
  }, [loadImage])

  // Clean up when modal closes
  const handleClose = useCallback(() => {
    setImageSrc('')
    onClose()
  }, [onClose])

  const onCropChange = useCallback((crop: any) => {
    setCrop(crop)
  }, [])

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom)
  }, [])

  const onCropCompleteHandler = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createCroppedImage = useCallback(async (): Promise<File> => {
    if (!imageSrc || !croppedAreaPixels) {
      throw new Error('No image or crop area available')
    }

    const image = new Image()
    image.src = imageSrc

    await new Promise((resolve) => {
      image.onload = resolve
    })

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    // Set canvas size to cropped area
    canvas.width = croppedAreaPixels.width
    canvas.height = croppedAreaPixels.height

    // Draw cropped image
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    )

    // Convert to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          throw new Error('Failed to create blob')
        }
      }, imageFile.type)
    })

    // Create File from blob
    return new File([blob], imageFile.name, {
      type: imageFile.type,
      lastModified: Date.now(),
    })
  }, [imageSrc, croppedAreaPixels, imageFile])

  const handleConfirm = useCallback(async () => {
    if (!croppedAreaPixels) return

    setIsProcessing(true)
    try {
      const croppedFile = await createCroppedImage()
      onCropComplete(croppedFile)
      handleClose()
    } catch (error) {
      console.error('Failed to crop image:', error)
      alert('Failed to crop image. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }, [croppedAreaPixels, createCroppedImage, onCropComplete, handleClose])

  return (
    <Modal isOpen={isOpen} onClose={handleClose} onOpen={handleOpen} title="Crop Image">
      {imageSrc ? (
        <div className="flex flex-col gap-4">
          {/* Crop Area */}
          <div className="relative w-full h-80 bg-black">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={ASPECT_RATIOS[aspect]}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropCompleteHandler}
              showGrid={true}
              style={{
                containerStyle: {
                  width: '100%',
                  height: '100%',
                },
              }}
            />
          </div>

          {/* Zoom Control */}
          <div className="flex items-center gap-3">
            <label className="text-caption-sm font-semibold text-foreground">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-2 bg-line rounded-lg appearance-none cursor-pointer"
              disabled={isProcessing}
            />
            <span className="text-caption-sm text-muted w-12 text-right">{Math.round(zoom * 100)}%</span>
          </div>

          {/* Aspect Ratio Info */}
          <p className="text-caption-xs text-muted text-center">
            Aspect ratio: {ASPECT_LABELS[aspect]}
          </p>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={handleClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} isLoading={isProcessing} disabled={!croppedAreaPixels}>
              {isProcessing ? 'Processing...' : 'Apply Crop'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-80">
          <Spinner className="h-8 w-8" />
        </div>
      )}
    </Modal>
  )
}
