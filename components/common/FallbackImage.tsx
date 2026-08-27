'use client';

import { useState, useCallback } from 'react';
import Image, { type ImageProps } from 'next/image';

interface FallbackImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  maxRetries?: number;
  shimmer?: boolean;
}

const SHIMMER_SVG = `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3e%3crect fill='%23e5e7eb' width='400' height='300'/%3e%3crect fill='%23d1d5db' x='0' y='0' width='400' height='300'%3e%3canimate attributeName='x' values='-200;400' dur='1.5s' repeatCount='indefinite'/%3e%3c/rect%3e%3c/svg%3e`;

export default function FallbackImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.png',
  maxRetries = 2,
  shimmer = true,
  placeholder = 'blur',
  blurDataURL = SHIMMER_SVG,
  ...props
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    if (retryCount < maxRetries) {
      const retryDelay = Math.pow(2, retryCount) * 1000;
      setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        setImgSrc(src);
      }, retryDelay);
    } else if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    } else {
      setHasError(true);
    }
  }, [retryCount, maxRetries, src, fallbackSrc, imgSrc]);

  if (hasError && !fallbackSrc) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 ${props.className || ''}`}
        style={{ width: props.width, height: props.height }}
      >
        <span className="text-sm text-gray-400">Image unavailable</span>
      </div>
    );
  }

  return <Image {...props} src={imgSrc} alt={alt} onError={handleError} />;
  return (
    <div className="relative overflow-hidden">
      {shimmer && !hasError && (
        <div
          className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700"
          aria-hidden="true"
        />
      )}
      <Image
        {...props}
        src={imgSrc}
        alt={alt}
        onError={handleError}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
      />
    </div>
  );
}
