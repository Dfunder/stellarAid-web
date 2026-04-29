'use client';

import { useState, useCallback } from 'react';
import { UploadedImage } from '@/components/ImageUpload';

/**
 * useImageUpload Hook
 *
 * A custom hook for managing image uploads with state management
 */
export function useImageUpload() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addImages = useCallback((newImages: UploadedImage[]) => {
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const updateImageProgress = useCallback((id: string, progress: number) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, uploadProgress: progress } : img
      )
    );
  }, []);

  const setImageError = useCallback((id: string, error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'message' in error
          ? String(error.message)
          : 'Upload failed';

    setImages((prev) =>
      prev.map((img) =>
        img.id === id
          ? {
              ...img,
              error: {
                code: 'unknown',
                message,
              },
            }
          : img
      )
    );
  }, []);

  const clearAll = useCallback(() => {
    setImages([]);
    setError(null);
  }, []);

  const uploadImages = useCallback(
    async <T,>(uploadFn: (images: UploadedImage[]) => Promise<T>) => {
      try {
        setIsLoading(true);
        setError(null);
        return await uploadFn(images);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upload images';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [images]
  );

  return {
    images,
    isLoading,
    error,
    addImages,
    removeImage,
    updateImageProgress,
    setImageError,
    clearAll,
    uploadImages,
  };
}
