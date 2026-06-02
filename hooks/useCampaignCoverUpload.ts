/**
 * useCampaignCoverUpload Hook
 * Manages campaign cover image upload state and operations
 */

'use client';

import { useState, useCallback } from 'react';

export interface CampaignCoverImage {
  id: string;
  url: string;
  publicId: string;
  uploadedAt: Date;
}

interface UseCampaignCoverUploadState {
  image: CampaignCoverImage | null;
  isUploading: boolean;
  error: string | null;
}

export function useCampaignCoverUpload() {
  const [state, setState] = useState<UseCampaignCoverUploadState>({
    image: null,
    isUploading: false,
    error: null,
  });

  const setImage = useCallback((image: CampaignCoverImage | null) => {
    setState((prev) => ({
      ...prev,
      image,
      error: null,
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({
      ...prev,
      error,
    }));
  }, []);

  const setIsUploading = useCallback((isUploading: boolean) => {
    setState((prev) => ({
      ...prev,
      isUploading,
    }));
  }, []);

  const handleUploadComplete = useCallback(
    (imageUrl: string, publicId: string) => {
      const image: CampaignCoverImage = {
        id: `cover_${Date.now()}`,
        url: imageUrl,
        publicId,
        uploadedAt: new Date(),
      };
      setImage(image);
      setIsUploading(false);
      setError(null);
    },
    [setImage, setIsUploading, setError]
  );

  const handleUploadError = useCallback(
    (error: string) => {
      setError(error);
      setIsUploading(false);
    },
    [setError, setIsUploading]
  );

  const clearImage = useCallback(() => {
    setState({
      image: null,
      isUploading: false,
      error: null,
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      image: null,
      isUploading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    setImage,
    setError,
    setIsUploading,
    handleUploadComplete,
    handleUploadError,
    clearImage,
    reset,
  };
}
