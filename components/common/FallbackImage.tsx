'use client';

import { useState, useCallback } from 'react';
import Image, { type ImageProps } from 'next/image';

interface FallbackImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  maxRetries?: number;
}

export default function FallbackImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.png',
  maxRetries = 2,
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
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  return <Image {...props} src={imgSrc} alt={alt} onError={handleError} />;
}
