'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export interface LightboxItem {
  src: string;
  alt?: string;
  title?: string;
  description?: string;
}

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  items: LightboxItem[];
  initialIndex?: number;
}

export default function Lightbox({ isOpen, onClose, items, initialIndex = 0 }: LightboxProps) {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const goToPrevRef = useRef<() => void>(() => {});
  const goToNextRef = useRef<() => void>(() => {});

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;
  const currentItem = items[currentIndex];

  const goToPrev = useCallback(() => {
    if (hasPrev) {
      setImageLoaded(false);
      setImageError(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [hasPrev]);

  const goToNext = useCallback(() => {
    if (hasNext) {
      setImageLoaded(false);
      setImageError(false);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [hasNext]);

  // Keep refs in sync so keyboard handler always has latest callbacks
  goToPrevRef.current = goToPrev;
  goToNextRef.current = goToNext;

  // Ensure portal only renders on client to avoid hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Clamp currentIndex when items array changes (e.g. shrinks while open)
  useEffect(() => {
    if (items.length > 0 && currentIndex >= items.length) {
      setCurrentIndex(Math.max(0, items.length - 1));
    }
  }, [items.length, currentIndex]);

  // Reset index and image state when lightbox opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setImageLoaded(false);
      setImageError(false);
    }
  }, [isOpen, initialIndex]);

  // Handle keyboard navigation and focus management
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';

    // Focus close button after mount
    const focusTimer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevRef.current();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNextRef.current();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    };
  }, [isOpen, onClose]);

  // Handle touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0]?.clientX ?? 0;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
    touchStartX.current = null;
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && items.length > 0 && (
        <motion.div
          key="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-label={currentItem?.title || currentItem?.alt || 'Image lightbox'}
        >
          {/* Close button */}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Image counter */}
          {items.length > 1 && (
            <div className="absolute top-4 left-4 z-10 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              {currentIndex + 1} / {items.length}
            </div>
          )}

          {/* Previous button */}
          {hasPrev && (
            <button
              onClick={goToPrev}
              className="absolute left-2 sm:left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/25 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Next button */}
          {hasNext && (
            <button
              onClick={goToNext}
              className="absolute right-2 sm:right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/25 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Main image container */}
          <div
            className="relative flex h-full w-full items-center justify-center px-16 py-20 sm:px-24"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative flex max-h-full max-w-full items-center justify-center"
              >
                {/* Loading spinner */}
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="h-8 w-8 animate-spin text-white/60"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  </div>
                )}

                {/* Error state */}
                {imageError && (
                  <div className="flex flex-col items-center gap-2 text-white/60">
                    <svg
                      className="h-12 w-12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-5-5L5 21" />
                    </svg>
                    <span className="text-sm">Failed to load image</span>
                  </div>
                )}

                <img
                  src={currentItem?.src}
                  alt={currentItem?.alt || currentItem?.title || 'Portfolio image'}
                  className={clsx(
                    'max-h-[75vh] max-w-full rounded-lg object-contain shadow-2xl transition-opacity duration-300 select-none',
                    imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'
                  )}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Title and description overlay */}
          <AnimatePresence>
            {(currentItem?.title || currentItem?.description) && imageLoaded && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-6 pb-8 pt-16"
              >
                {currentItem?.title && (
                  <h3 className="text-lg font-semibold text-white sm:text-xl">
                    {currentItem.title}
                  </h3>
                )}
                {currentItem?.description && (
                  <p className="mt-1 max-w-2xl text-sm text-white/70 sm:text-base">
                    {currentItem.description}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
