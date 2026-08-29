'use client';

import { useState, useEffect, useRef } from 'react';
import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/cn';

interface LazyImageProps extends Omit<ImageProps, 'srcSet' | 'sizes'> {
  rootMargin?: string;
  threshold?: number;
  placeholder?: 'blur' | 'empty';
}

const DEFAULT_ROOT_MARGIN = '100px 0px';
const SHIMMER_DATA_URL =
  'data:image/svg+xml,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3e%3crect fill="%23e5e7eb" width="400" height="300"/%3e%3c/svg%3e';

export default function LazyImage({
  src,
  alt,
  className,
  width,
  height,
  fill = false,
  rootMargin = DEFAULT_ROOT_MARGIN,
  threshold = 0,
  placeholder = 'empty',
  blurDataURL,
  priority = false,
  sizes,
  ...props
}: Readonly<LazyImageProps>) {
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) {
      setHasBeenInView(true);
      return;
    }

    if (hasBeenInView) return;

    const element = containerRef.current;
    if (!element) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setHasBeenInView(true);
              observer.disconnect();
            }
          });
        },
        { rootMargin, threshold }
      );
      observer.observe(element);
      return () => observer.disconnect();
    }

    setHasBeenInView(true);
  }, [priority, hasBeenInView, rootMargin, threshold]);

  const shimmerDataURL = blurDataURL || SHIMMER_DATA_URL;
  const showSkeleton = !hasLoaded && placeholder !== 'empty';

  const imageSrc = src;
  const imageProps: ImageProps = {
    src: imageSrc,
    alt,
    loading: (priority ? 'eager' : 'lazy') as 'lazy' | 'eager',
    decoding: 'async',
    placeholder: placeholder === 'blur' ? 'blur' : 'empty',
    blurDataURL: placeholder === 'blur' ? shimmerDataURL : undefined,
    sizes: sizes || '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw',
    className,
    onLoad: () => setHasLoaded(true),
    ...props,
  };

  if (fill) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'absolute inset-0 size-full',
          showSkeleton && 'animate-pulse bg-neutral-200 dark:bg-neutral-700'
        )}
      >
        {hasBeenInView && <Image {...imageProps} fill />}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        showSkeleton && 'animate-pulse bg-neutral-200 dark:bg-neutral-700'
      )}
      style={width && height ? { width, height } : undefined}
    >
      {showSkeleton && (
        <div
          className="absolute inset-0 animate-pulse bg-neutral-200 dark:bg-neutral-700"
          aria-hidden="true"
        />
      )}
      {hasBeenInView && <Image {...imageProps} />}
    </div>
  );
}
