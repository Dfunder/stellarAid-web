'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import {
  uploadToCloudinary,
  getImageDimensions,
  validateAspectRatio,
} from '@/lib/api/cloudinary';
import { formatFileSize } from '@/utils/imageUpload';

export interface CampaignCoverUploadProps {
  onUploadComplete?: (imageUrl: string, publicId: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export interface UploadState {
  preview: string | null;
  isLoading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
  publicId: string | null;
}

const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ASPECT_RATIO_16_9 = 16 / 9;

export const CampaignCoverUpload = React.forwardRef<
  HTMLDivElement,
  CampaignCoverUploadProps
>(function CampaignCoverUpload(
  { onUploadComplete, onError, disabled = false, className },
  ref
) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragOverRef = useRef(false);

  const [uploadState, setUploadState] = useState<UploadState>({
    preview: null,
    isLoading: false,
    progress: 0,
    error: null,
    success: false,
    publicId: null,
  });

  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      // Check file type
      if (!ACCEPTED_FORMATS.includes(file.type)) {
        const error = `Invalid file format. Accepted formats: JPG, PNG, WebP`;
        return { valid: false, error };
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        const error = `File size exceeds maximum of ${formatFileSize(MAX_FILE_SIZE)}`;
        return { valid: false, error };
      }

      return { valid: true };
    },
    []
  );

  const validateDimensions = useCallback(async (file: File): Promise<{ valid: boolean; error?: string }> => {
    try {
      const { width, height } = await getImageDimensions(file);

      // Allow some tolerance (5%) for aspect ratio
      const tolerance = 0.05;
      const targetRatio = ASPECT_RATIO_16_9;
      const actualRatio = width / height;

      if (Math.abs(actualRatio - targetRatio) > tolerance) {
        return {
          valid: false,
          error: `Image aspect ratio must be 16:9 (current: ${(actualRatio).toFixed(2)}:1)`,
        };
      }

      return { valid: true };
    } catch (err) {
      return {
        valid: false,
        error: 'Failed to validate image dimensions',
      };
    }
  }, []);

  const handleFileUpload = useCallback(
    async (file: File) => {
      // Reset state
      setUploadState({
        preview: null,
        isLoading: true,
        progress: 0,
        error: null,
        success: false,
        publicId: null,
      });

      try {
        // Validate file
        const fileValidation = validateFile(file);
        if (!fileValidation.valid) {
          setUploadState((prev) => ({
            ...prev,
            isLoading: false,
            error: fileValidation.error || 'Invalid file',
          }));
          onError?.(fileValidation.error || 'Invalid file');
          return;
        }

        // Validate dimensions
        const dimensionValidation = await validateDimensions(file);
        if (!dimensionValidation.valid) {
          setUploadState((prev) => ({
            ...prev,
            isLoading: false,
            error: dimensionValidation.error || 'Invalid dimensions',
          }));
          onError?.(dimensionValidation.error || 'Invalid dimensions');
          return;
        }

        // Generate preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadState((prev) => ({
            ...prev,
            preview: e.target?.result as string,
            progress: 30,
          }));
        };
        reader.readAsDataURL(file);

        // Upload to Cloudinary
        setUploadState((prev) => ({ ...prev, progress: 50 }));

        const response = await uploadToCloudinary(file, {
          folder: 'stellaraid/campaigns',
        });

        setUploadState((prev) => ({
          ...prev,
          progress: 100,
          success: true,
          isLoading: false,
          publicId: response.public_id,
        }));

        onUploadComplete?.(response.secure_url, response.public_id);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to upload image';
        setUploadState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        onError?.(errorMessage);
      }
    },
    [validateFile, validateDimensions, onUploadComplete, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      dragOverRef.current = false;

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    [disabled, handleFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragOverRef.current = true;
  }, []);

  const handleDragLeave = useCallback(() => {
    dragOverRef.current = false;
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.currentTarget.files;
      if (files?.length) {
        handleFileUpload(files[0]);
      }
    },
    [handleFileUpload]
  );

  const handleClick = useCallback(() => {
    if (!disabled && !uploadState.isLoading) {
      fileInputRef.current?.click();
    }
  }, [disabled, uploadState.isLoading]);

  const handleRemove = useCallback(() => {
    setUploadState({
      preview: null,
      isLoading: false,
      progress: 0,
      error: null,
      success: false,
      publicId: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div ref={ref} className={className}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={clsx(
          'relative rounded-lg border-2 border-dashed transition-colors cursor-pointer',
          disabled || uploadState.isLoading
            ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
            : uploadState.error
              ? 'border-red-300 bg-red-50 hover:border-red-400'
              : uploadState.success
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50',
          dragOverRef.current && !disabled ? 'border-blue-400 bg-blue-50' : ''
        )}
      >
        {/* Preview Image */}
        {uploadState.preview && (
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <img
              src={uploadState.preview}
              alt="Upload preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50" />
          </div>
        )}

        {/* Content */}
        <div className="relative flex flex-col items-center justify-center py-12 px-6">
          {uploadState.isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  Uploading image...
                </p>
                <div className="mt-2 w-48 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-300"
                    style={{ width: `${uploadState.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : uploadState.success ? (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  Image uploaded successfully
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Choose different image
                </button>
              </div>
            </div>
          ) : uploadState.error ? (
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  Upload failed
                </p>
                <p className="text-xs text-red-600 mt-1">{uploadState.error}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-gray-400 mb-3" />
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                Drag and drop your cover image
              </h3>
              <p className="text-xs text-gray-500 text-center mb-3">
                or click to select from your computer
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  <span className="font-medium">Formats:</span> JPG, PNG, WebP
                </p>
                <p>
                  <span className="font-medium">Max size:</span> 5MB
                </p>
                <p>
                  <span className="font-medium">Aspect ratio:</span> 16:9
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FORMATS.join(',')}
        onChange={handleFileSelect}
        disabled={disabled}
        className="hidden"
        aria-label="Upload campaign cover image"
      />

      {/* Requirements Info */}
      {!uploadState.preview && !uploadState.error && !uploadState.success && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            Requirements:
          </h4>
          <ul className="space-y-1 text-xs text-blue-800">
            <li>• Aspect ratio must be exactly 16:9 (e.g., 1920x1080, 1280x720)</li>
            <li>• File size must not exceed 5MB</li>
            <li>• Supported formats: JPG, PNG, WebP</li>
            <li>• Image will be optimized for web delivery</li>
          </ul>
        </div>
      )}
    </div>
  );
});

CampaignCoverUpload.displayName = 'CampaignCoverUpload';
