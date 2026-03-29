/**
 * Image upload utilities for validation, compression, and processing
 */

export interface ImageValidationOptions {
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  maxDimensions?: { width: number; height: number };
}

export interface ImageUploadError {
  code: 'invalid-type' | 'invalid-size' | 'invalid-dimensions' | 'unknown';
  message: string;
}

// Default validation options
export const DEFAULT_VALIDATION_OPTIONS: ImageValidationOptions = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxDimensions: { width: 4000, height: 4000 },
};

/**
 * Validates a file based on type and size
 */
export function validateImageFile(
  file: File,
  options: ImageValidationOptions = DEFAULT_VALIDATION_OPTIONS
): ImageUploadError | null {
  // Check file type
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    return {
      code: 'invalid-type',
      message: `Invalid file type. Allowed types: ${options.allowedTypes.join(', ')}`,
    };
  }

  // Check file size
  if (options.maxFileSize && file.size > options.maxFileSize) {
    const maxSizeMB = (options.maxFileSize / (1024 * 1024)).toFixed(2);
    return {
      code: 'invalid-size',
      message: `File size exceeds maximum of ${maxSizeMB}MB`,
    };
  }

  return null;
}

/**
 * Validates image dimensions
 */
export async function validateImageDimensions(
  file: File,
  options: ImageValidationOptions = DEFAULT_VALIDATION_OPTIONS
): Promise<ImageUploadError | null> {
  if (!options.maxDimensions) return null;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (
          img.width > options.maxDimensions!.width ||
          img.height > options.maxDimensions!.height
        ) {
          resolve({
            code: 'invalid-dimensions',
            message: `Image dimensions exceed maximum of ${options.maxDimensions!.width}x${options.maxDimensions!.height}px`,
          });
        } else {
          resolve(null);
        }
      };
      img.onerror = () => {
        resolve(null); // If we can't read dimensions, don't fail
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      resolve(null);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an image file
 */
export async function compressImage(
  file: File,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw and compress
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
}

/**
 * Generates a preview URL for an image file
 */
export function generateImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revokes an image preview URL to free memory
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Formats file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Gets the file extension from a filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}
