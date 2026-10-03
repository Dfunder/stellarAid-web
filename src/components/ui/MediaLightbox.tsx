import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from 'react'
import { cn } from '@/lib'

export function normalizeImageList(images: Array<string | null | undefined> | null | undefined): string[] {
  return (images ?? [])
    .map((image) => (typeof image === 'string' ? image.trim() : ''))
    .filter((image) => image.length > 0)
}

export function clampIndex(index: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(Math.max(index, 0), total - 1)
}

export function getAdjacentIndices(index: number, total: number): { previous: number; next: number } {
  const safeTotal = total <= 0 ? 1 : total
  const safeIndex = clampIndex(index, safeTotal)

  return {
    previous: (safeIndex - 1 + safeTotal) % safeTotal,
    next: (safeIndex + 1) % safeTotal,
  }
}

const clampZoom = (value: number): number => Math.min(Math.max(value, 1), 3)
const clampPan = (value: number, zoom: number): number => {
  if (zoom <= 1) return 0
  const limit = 180 * (zoom - 1)
  return Math.min(Math.max(value, -limit), limit)
}

const getTouchDistance = (touchA: Touch, touchB: Touch): number => {
  const dx = touchA.clientX - touchB.clientX
  const dy = touchA.clientY - touchB.clientY
  return Math.hypot(dx, dy)
}

export interface MediaLightboxProps {
  isOpen: boolean
  images: Array<string | null | undefined>
  title: string
  description?: string
  activeIndex?: number
  onClose: () => void
  onIndexChange?: (index: number) => void
}

export default function MediaLightbox({
  isOpen,
  images,
  title,
  description,
  activeIndex = 0,
  onClose,
  onIndexChange,
}: MediaLightboxProps) {
  const normalizedImages = useMemo(() => normalizeImageList(images), [images])
  const [currentIndex, setCurrentIndex] = useState(() => clampIndex(activeIndex, normalizedImages.length || 1))
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null)
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null)
  const panStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null)

  const safeIndex = clampIndex(currentIndex, normalizedImages.length || 1)
  const currentImage = normalizedImages[safeIndex] ?? normalizedImages[0]

  const updateIndex = useCallback(
    (next: number) => {
      const bounded = clampIndex(next, normalizedImages.length || 1)
      setCurrentIndex(bounded)
      onIndexChange?.(bounded)
    },
    [normalizedImages.length, onIndexChange],
  )

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        updateIndex(safeIndex + 1)
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        updateIndex(safeIndex - 1)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose, safeIndex, updateIndex])

  useEffect(() => {
    const boundedIndex = clampIndex(activeIndex, normalizedImages.length || 1)
    setCurrentIndex(boundedIndex)
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }, [activeIndex, normalizedImages.length])

  useEffect(() => {
    if (!isOpen || !currentImage) return
    const adjacent = getAdjacentIndices(safeIndex, normalizedImages.length || 1)
    ;[normalizedImages[adjacent.previous], normalizedImages[adjacent.next]].forEach((image) => {
      if (!image) return
      const img = new Image()
      img.src = image
    })
  }, [currentImage, isOpen, normalizedImages, safeIndex])

  const handleZoom = useCallback((nextZoom: number) => {
    setZoom(clampZoom(nextZoom))
    if (clampZoom(nextZoom) <= 1) {
      setOffset({ x: 0, y: 0 })
    }
  }, [])

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      event.preventDefault()
      const nextZoom = zoom * (1 - event.deltaY * 0.0012)
      handleZoom(nextZoom)
    },
    [handleZoom, zoom],
  )

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      if (zoom > 1) {
        panStartRef.current = {
          x: event.clientX,
          y: event.clientY,
          offsetX: offset.x,
          offsetY: offset.y,
        }
      } else {
        swipeStartRef.current = { x: event.clientX, y: event.clientY }
      }
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [offset.x, offset.y, zoom],
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!panStartRef.current || zoom <= 1) return
      const dx = event.clientX - panStartRef.current.x
      const dy = event.clientY - panStartRef.current.y
      setOffset({
        x: clampPan(panStartRef.current.offsetX + dx, zoom),
        y: clampPan(panStartRef.current.offsetY + dy, zoom),
      })
    },
    [zoom],
  )

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!swipeStartRef.current || zoom > 1) {
        panStartRef.current = null
        return
      }

      const dx = event.clientX - swipeStartRef.current.x
      const dy = event.clientY - swipeStartRef.current.y
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) {
          updateIndex(safeIndex + 1)
        } else {
          updateIndex(safeIndex - 1)
        }
      }

      swipeStartRef.current = null
      panStartRef.current = null
    },
    [safeIndex, updateIndex, zoom],
  )

  const handleTouchStart = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      if (event.touches.length === 2) {
        const [touchA, touchB] = Array.from(event.touches)
        pinchRef.current = {
          distance: getTouchDistance(touchA, touchB),
          zoom,
        }
        return
      }

      if (event.touches.length === 1) {
        swipeStartRef.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        }
        if (zoom > 1) {
          panStartRef.current = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
            offsetX: offset.x,
            offsetY: offset.y,
          }
        }
      }
    },
    [offset.x, offset.y, zoom],
  )

  const handleTouchMove = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      if (event.touches.length === 2 && pinchRef.current) {
        const [touchA, touchB] = Array.from(event.touches)
        const nextDistance = getTouchDistance(touchA, touchB)
        const scale = (nextDistance / pinchRef.current.distance) * pinchRef.current.zoom
        handleZoom(scale)
        return
      }

      if (event.touches.length === 1 && panStartRef.current && zoom > 1) {
        const dx = event.touches[0].clientX - panStartRef.current.x
        const dy = event.touches[0].clientY - panStartRef.current.y
        setOffset({
          x: clampPan(panStartRef.current.offsetX + dx, zoom),
          y: clampPan(panStartRef.current.offsetY + dy, zoom),
        })
      }
    },
    [handleZoom, zoom],
  )

  const handleTouchEnd = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      if (zoom > 1) {
        pinchRef.current = null
        panStartRef.current = null
        return
      }

      if (swipeStartRef.current && event.changedTouches.length > 0) {
        const touch = event.changedTouches[0]
        const dx = touch.clientX - swipeStartRef.current.x
        const dy = touch.clientY - swipeStartRef.current.y
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) {
            updateIndex(safeIndex + 1)
          } else {
            updateIndex(safeIndex - 1)
          }
        }
      }

      swipeStartRef.current = null
      pinchRef.current = null
      panStartRef.current = null
    },
    [safeIndex, updateIndex, zoom],
  )

  if (!isOpen || normalizedImages.length === 0) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/90 p-3 sm:p-6">
      <button
        type="button"
        aria-label="Close media viewer"
        onClick={onClose}
        className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 text-2xl text-white transition hover:bg-black/45"
      >
        ×
      </button>

      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3 text-caption-sm text-white/80 sm:px-6">
        <div>
          <div className="font-semibold">{title}</div>
          {description ? <div className="text-white/60">{description}</div> : null}
        </div>
        <div className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5">
          {safeIndex + 1} / {normalizedImages.length}
        </div>
      </div>

      <div className="relative flex h-full w-full max-w-6xl items-center justify-center overflow-hidden rounded-2xl">
        <button
          type="button"
          aria-label="Previous image"
          onClick={() => updateIndex(safeIndex - 1)}
          className="absolute left-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-xl text-white shadow-lg transition hover:bg-black/45 sm:left-6"
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Next image"
          onClick={() => updateIndex(safeIndex + 1)}
          className="absolute right-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-xl text-white shadow-lg transition hover:bg-black/45 sm:right-6"
        >
          →
        </button>

        <div
          className="relative flex h-[72vh] max-h-[900px] w-full items-center justify-center overflow-hidden rounded-2xl bg-neutral-950"
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => {
            swipeStartRef.current = null
            pinchRef.current = null
            panStartRef.current = null
          }}
          style={{ touchAction: 'none' }}
        >
          <img
            key={currentImage}
            src={currentImage}
            alt={`${title} ${safeIndex + 1}`}
            className={cn(
              'max-h-full max-w-full select-none object-contain transition-transform duration-200 ease-out will-change-transform',
              zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
            )}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transition: zoom > 1 ? 'transform 0.12s ease-out' : 'transform 0.2s ease-out',
            }}
            draggable={false}
            onDoubleClick={() => handleZoom(zoom > 1 ? 1 : 2)}
          />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center px-3 sm:bottom-6">
        <div className="flex max-w-full items-center gap-2 overflow-x-auto rounded-full border border-white/10 bg-black/35 px-2 py-2 backdrop-blur-sm">
          {normalizedImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              aria-label={`View image ${index + 1}`}
              onClick={() => updateIndex(index)}
              className={cn(
                'h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 bg-neutral-900 transition',
                index === safeIndex ? 'border-primary shadow-[0_0_0_2px_rgba(255,255,255,0.2)]' : 'border-transparent opacity-70 hover:opacity-100',
              )}
            >
              <img src={image} alt={`${title} thumbnail ${index + 1}`} className="h-full w-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
