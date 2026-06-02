/**
 * Cloudinary API utilities for image upload and transformation
 */

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

interface UploadOptions {
  folder?: string;
  transformation?: {
    quality?: 'auto' | string;
    fetch_format?: 'auto';
  };
}

/**
 * Upload image to Cloudinary
 */
export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<CloudinaryResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

  if (options.folder) {
    formData.append('folder', options.folder);
  }

  // Add transformation parameters
  const transformations: Record<string, unknown> = {
    quality: 'auto',
    fetch_format: 'auto',
    aspect_ratio: '16:9',
    crop: 'fill',
    gravity: 'auto',
  };

  if (options.transformation?.quality) {
    transformations.quality = options.transformation.quality;
  }

  formData.append('transformation', JSON.stringify([transformations]));

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured');
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to upload image to Cloudinary');
  }

  return response.json();
}

/**
 * Get optimized Cloudinary URL for image
 */
export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | string;
    format?: 'auto' | string;
    crop?: 'fill' | 'fit' | 'scale';
    gravity?: string;
  } = {}
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured');
  }

  const params = new URLSearchParams();

  // Image transformations
  if (options.width) params.append('w', options.width.toString());
  if (options.height) params.append('h', options.height.toString());
  params.append('q', options.quality || 'auto');
  params.append('f', options.format || 'auto');
  if (options.crop) params.append('c', options.crop);
  if (options.gravity) params.append('g', options.gravity);

  return `https://res.cloudinary.com/${cloudName}/image/upload/${params.toString()}/${publicId}`;
}

/**
 * Delete image from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  const response = await fetch('/api/cloudinary/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete image from Cloudinary');
  }
}

/**
 * Validate image dimensions meet 16:9 aspect ratio
 */
export function validateAspectRatio(
  width: number,
  height: number,
  tolerance: number = 0.05
): boolean {
  const targetRatio = 16 / 9;
  const actualRatio = width / height;
  return Math.abs(actualRatio - targetRatio) <= tolerance;
}

/**
 * Get image dimensions from file
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}
