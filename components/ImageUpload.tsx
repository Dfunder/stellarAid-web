'use client';

import React, {
  useCallback,
  useRef,
  useState,
  forwardRef,
  useEffect,
} from 'react';
import { clsx } from 'clsx';
import { Upload, Trash2, AlertCircle, CheckCircle, X } from 'lucide-react';
import {
  validateImageFile,
  validateImageDimensions,
  compressImage,
  generateImagePreview,
  revokeImagePreview,
  formatFileSize,
  ImageValidationOptions,
  ImageUploadError,
} from '@/utils/imageUpload';

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  size: number;
  uploadProgress?: number;
  error?: ImageUploadError;
  isCompressed?: boolean;
}

export interface ImageUploadProps {
  onUpload?: (files: UploadedImage[]) => Promise<void> | void;
  onRemove?: (id: string) => void;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  validationOptions?: ImageValidationOptions;
  showPreview?: boolean;
  showProgress?: boolean;
  enableCompression?: boolean;
  compressionQuality?: number;
}

/**
 * ImageUpload Component
 *
 * A reusable, fully-featured image upload component with:
 * - Drag and drop support
 * - Click to browse
 * - Image preview thumbnails
 * - Delete button for each image
 * - File type and size validation
 * - Upload progress bar
 * - Multiple image support
 * - Error handling and display
 * - Optional image compression
 */
export const ImageUpload = forwardRef<HTMLDivElement, ImageUploadProps>(
  (
    {
      onUpload,
      onRemove,
      maxFiles = 10,
      multiple = true,
      disabled = false,
      className,
      validationOptions,
      showPreview = true,
      showProgress = true,
      enableCompression = false,
      compressionQuality = 0.8,
    },
    ref
  ) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounter = useRef(0);
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Handle file selection and validation
    const handleFiles = useCallback(
      async (files: FileList | null) => {
        if (!files || disabled) return;

        const fileArray = Array.from(files);
        const newImages: UploadedImage[] = [];
        const errors: { file: string; error: ImageUploadError }[] = [];

        // Check max files limit
        if (
          multiple
            ? uploadedImages.length + fileArray.length > maxFiles
            : fileArray.length > 1
        ) {
          errors.push({
            file: 'general',
            error: {
              code: 'invalid-size',
              message: `Cannot upload more than ${maxFiles} image${maxFiles !== 1 ? 's' : ''}`,
            },
          });
        }

        // Process each file
        for (const file of fileArray) {
          // Validate file
          const validationError = validateImageFile(file, validationOptions);
          if (validationError) {
            errors.push({ file: file.name, error: validationError });
            continue;
          }

          // Validate dimensions
          const dimensionError = await validateImageDimensions(
            file,
            validationOptions
          );
          if (dimensionError) {
            errors.push({ file: file.name, error: dimensionError });
            continue;
          }

          // Generate preview
          const preview = generateImagePreview(file);
          const id = `${Date.now()}-${Math.random()}`;

          let fileToUpload = file;
          let isCompressed = false;

          // Compress if enabled
          if (enableCompression && file.type === 'image/jpeg') {
            try {
              fileToUpload = await compressImage(file, compressionQuality);
              isCompressed = true;
            } catch (error) {
              console.warn('Image compression failed, using original:', error);
            }
          }

          newImages.push({
            id,
            file: fileToUpload,
            preview,
            size: fileToUpload.size,
            uploadProgress: 0,
            isCompressed,
          });
        }

        // Update state with new images
        setUploadedImages((prev) => [...prev, ...newImages]);

        // Call onUpload callback if provided
        if (onUpload && newImages.length > 0) {
          setIsUploading(true);
          try {
            await onUpload(newImages);
          } catch (error) {
            console.error('Upload error:', error);
            // Update progress for failed uploads
            setUploadedImages((prev) =>
              prev.map((img) =>
                newImages.some((ni) => ni.id === img.id)
                  ? {
                      ...img,
                      error: {
                        code: 'unknown',
                        message: 'Failed to upload image',
                      },
                      uploadProgress: 0,
                    }
                  : img
              )
            );
          } finally {
            setIsUploading(false);
          }
        }

        // Show errors if any
        if (errors.length > 0) {
          console.error('File validation errors:', errors);
          // You can emit these errors to a toast/notification system
        }

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      [uploadedImages, multiple, maxFiles, onUpload, disabled, validationOptions, enableCompression, compressionQuality]
    );

    // Handle drag and drop events
    const handleDragEnter = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current += 1;
      if (e.dataTransfer?.items) {
        setIsDragging(true);
      }
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current -= 1;
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current = 0;
        setIsDragging(false);

        if (e.dataTransfer?.files) {
          handleFiles(e.dataTransfer.files);
        }
      },
      [handleFiles]
    );

    // Handle click to browse
    const handleClick = useCallback(() => {
      if (!disabled) {
        fileInputRef.current?.click();
      }
    }, [disabled]);

    // Handle file input change
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
      },
      [handleFiles]
    );

    // Handle image removal
    const handleRemoveImage = useCallback(
      (id: string) => {
        setUploadedImages((prev) => {
          const imageToRemove = prev.find((img) => img.id === id);
          if (imageToRemove) {
            revokeImagePreview(imageToRemove.preview);
          }
          return prev.filter((img) => img.id !== id);
        });
        onRemove?.(id);
      },
      [onRemove]
    );

    // Cleanup previews on unmount
    useEffect(() => {
      return () => {
        uploadedImages.forEach((img) => {
          revokeImagePreview(img.preview);
        });
      };
    }, []);

    const canAddMore = uploadedImages.length < maxFiles;
    const showUploadArea = multiple || uploadedImages.length === 0;

    return (
      <div ref={ref} className={clsx('w-full', className)}>
        {/* Upload Area */}
        {showUploadArea && (
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClick}
            className={clsx(
              'relative w-full border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer',
              {
                'border-blue-400 bg-blue-50 dark:bg-blue-900/20': isDragging && !disabled,
                'border-gray-300 bg-gray-50 dark:bg-gray-900 dark:border-gray-700':
                  !isDragging && !disabled,
                'border-gray-200 bg-gray-100 dark:bg-gray-800/50 opacity-60 cursor-not-allowed':
                  disabled,
              }
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple={multiple && canAddMore}
              accept="image/*"
              onChange={handleInputChange}
              disabled={disabled}
              className="hidden"
              aria-label="Upload images"
            />

            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <div className="p-3 rounded-full bg-gray-200 dark:bg-gray-700">
                <Upload
                  className={clsx('w-6 h-6', {
                    'text-gray-600 dark:text-gray-300': !isDragging,
                    'text-blue-600': isDragging && !disabled,
                  })}
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {isDragging
                    ? 'Drop your images here'
                    : 'Drag and drop images here or click to browse'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {canAddMore
                    ? `You can upload up to ${maxFiles - uploadedImages.length} more image${maxFiles - uploadedImages.length !== 1 ? 's' : ''}`
                    : 'Maximum images reached'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Image Previews */}
        {uploadedImages.length > 0 && showPreview && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''}{' '}
              selected
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {uploadedImages.map((image) => (
                <ImagePreviewCard
                  key={image.id}
                  image={image}
                  onRemove={handleRemoveImage}
                  showProgress={showProgress}
                  isUploading={isUploading}
                />
              ))}
            </div>
          </div>
        )}

        {/* No images message */}
        {uploadedImages.length === 0 && showPreview && (
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {disabled ? 'Image upload is disabled' : 'No images selected yet'}
          </div>
        )}
      </div>
    );
  }
);

ImageUpload.displayName = 'ImageUpload';

/**
 * Image Preview Card Component
 */
interface ImagePreviewCardProps {
  image: UploadedImage;
  onRemove: (id: string) => void;
  showProgress: boolean;
  isUploading: boolean;
}

const ImagePreviewCard: React.FC<ImagePreviewCardProps> = ({
  image,
  onRemove,
  showProgress,
  isUploading,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative group">
      {/* Image Container */}
      <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden aspect-square">
        {!imageError ? (
          <img
            src={image.preview}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />

        {/* Delete Button */}
        <button
          onClick={() => onRemove(image.id)}
          disabled={isUploading}
          className={clsx(
            'absolute top-1 right-1 p-1 rounded-full bg-red-500/90 text-white transition-all',
            'opacity-0 group-hover:opacity-100',
            'hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label="Remove image"
          title="Remove image"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Status Indicator */}
        {image.error ? (
          <div className="absolute bottom-1 right-1 p-1 rounded-full bg-red-500 text-white">
            <AlertCircle className="w-4 h-4" />
          </div>
        ) : isUploading && image.uploadProgress !== undefined && image.uploadProgress < 100 ? (
          <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center">
            <span className="text-xs font-bold">{image.uploadProgress}%</span>
          </div>
        ) : image.uploadProgress === 100 ? (
          <div className="absolute bottom-1 right-1 p-1 rounded-full bg-green-500 text-white">
            <CheckCircle className="w-4 h-4" />
          </div>
        ) : null}
      </div>

      {/* Image Info */}
      <div className="mt-2">
        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
          {image.file.name}
        </p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {formatFileSize(image.size)}
          </p>
          {image.isCompressed && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
              Compressed
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {showProgress && isUploading && image.uploadProgress !== undefined && (
        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${image.uploadProgress}%` }}
          />
        </div>
      )}

      {/* Error Message */}
      {image.error && (
        <div className="mt-2 flex items-start gap-1">
          <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-500 dark:text-red-400 line-clamp-2">
            {image.error.message}
          </p>
        </div>
      )}
    </div>
  );
};
