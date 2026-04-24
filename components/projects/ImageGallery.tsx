/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { clsx } from 'clsx';

export interface GalleryImage {
  src: string;
  alt?: string;
  caption?: string;
  thumbnail?: string;
}

export interface ImageGalleryProps {
  images: GalleryImage[];
  initialIndex?: number;
  className?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  initialIndex = 0,
  className = '',
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(initialIndex);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState('center center');

  const activeImage = useMemo(() => images[selectedIndex] || images[0], [images, selectedIndex]);

  const openLightbox = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      setIsZoomed(false);
      setZoomOrigin('center center');
      setIsLightboxOpen(true);
    },
    []
  );

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    setIsZoomed(false);
    setZoomOrigin('center center');
  }, []);

  const showPrevious = useCallback(() => {
    setSelectedIndex((current) => (current - 1 + images.length) % images.length);
    setIsZoomed(false);
    setZoomOrigin('center center');
  }, [images.length]);

  const showNext = useCallback(() => {
    setSelectedIndex((current) => (current + 1) % images.length);
    setIsZoomed(false);
    setZoomOrigin('center center');
  }, [images.length]);

  const toggleZoom = useCallback(() => {
    setIsZoomed((value) => !value);
  }, []);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!isZoomed) {
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      setZoomOrigin(`${x}% ${y}%`);
    },
    [isZoomed]
  );

  if (!images || images.length === 0) {
    return (
      <div className={clsx('rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-center text-sm text-neutral-500', className)}>
        No images available.
      </div>
    );
  }

  return (
    <div className={clsx('space-y-4', className)}>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => openLightbox(selectedIndex)}
          className="group relative w-full overflow-hidden rounded-[28px] border border-neutral-200 bg-neutral-100 shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
          aria-label="Open image lightbox"
        >
          <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full bg-black/5">
            <img
              src={activeImage.src}
              alt={activeImage.alt || `Project image ${selectedIndex + 1}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <span className="absolute left-4 bottom-4 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition-opacity duration-200 opacity-90">
              <span>{selectedIndex + 1}/{images.length}</span>
              <span className="hidden sm:inline">View gallery</span>
            </span>
          </div>
        </button>

        {activeImage.caption ? (
          <p className="text-sm text-neutral-600">{activeImage.caption}</p>
        ) : null}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {images.map((image, index) => (
          <button
            key={`${image.src}-${index}`}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className={clsx(
              'shrink-0 w-20 sm:w-24 rounded-3xl overflow-hidden border transition-all duration-200',
              selectedIndex === index
                ? 'border-primary-500 ring-2 ring-primary-200'
                : 'border-neutral-200 hover:border-neutral-300'
            )}
            aria-label={`Show thumbnail ${index + 1}`}
          >
            <img
              src={image.thumbnail || image.src}
              alt={image.alt || `Thumbnail ${index + 1}`}
              loading="lazy"
              className="h-20 w-full object-cover"
            />
          </button>
        ))}
      </div>

      {isLightboxOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/90" onClick={closeLightbox} />

          <div className="relative z-10 flex w-full max-w-[1200px] flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-neutral-200">
                <span>{selectedIndex + 1} / {images.length}</span>
                {activeImage.caption ? <span className="truncate max-w-[240px]">• {activeImage.caption}</span> : null}
              </div>
              <button
                type="button"
                onClick={closeLightbox}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Close lightbox"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-2xl">
              <div
                className="relative h-[65vh] min-h-[320px] overflow-hidden"
                onMouseMove={handleMouseMove}
                onClick={toggleZoom}
              >
                <img
                  src={activeImage.src}
                  alt={activeImage.alt || `Lightbox image ${selectedIndex + 1}`}
                  loading="lazy"
                  className={clsx(
                    'h-full w-full object-contain transition-transform duration-300',
                    isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
                  )}
                  style={{
                    transform: isZoomed ? 'scale(2)' : 'scale(1)',
                    transformOrigin: zoomOrigin,
                  }}
                />
              </div>

              <button
                type="button"
                onClick={showPrevious}
                className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition hover:bg-black/60"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition hover:bg-black/60"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-200 shadow-lg">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-neutral-100">
                  {activeImage.caption || activeImage.alt || 'Project image'}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleZoom}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-white transition hover:bg-white/20"
              >
                {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                <span>{isZoomed ? 'Zoom out' : 'Zoom in'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ImageGallery;
