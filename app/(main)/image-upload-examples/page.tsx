'use client';

import { useState, useRef } from 'react';
import { ImageUpload, UploadedImage } from '@/components/ImageUpload';
import { useImageUpload } from '@/hooks/useImageUpload';
import { ImageGallery } from '@/components/projects/ImageGallery';

/**
 * ImageUploadExamples
 * 
 * Multiple examples showing different usage patterns of the ImageUpload component
 */

// Example 1: Simple Direct Usage
export function SimpleUploadExample() {
  const handleUpload = async (images: UploadedImage[]) => {
    console.log('Uploading images:', images);
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Simple Upload</h2>
      <ImageUpload onUpload={handleUpload} maxFiles={5} />
    </div>
  );
}

// Example 2: With Custom Validation
export function CustomValidationExample() {
  const handleUpload = async (images: UploadedImage[]) => {
    console.log('Uploading validated images:', images);
  };

  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Custom Validation</h2>
      <ImageUpload
        onUpload={handleUpload}
        validationOptions={{
          maxFileSize: 2 * 1024 * 1024, // 2MB
          allowedTypes: ['image/jpeg', 'image/png'],
          maxDimensions: { width: 1920, height: 1080 },
        }}
        maxFiles={1}
        multiple={false}
      />
    </div>
  );
}

// Example 3: With Compression
export function CompressionExample() {
  const handleUpload = async (images: UploadedImage[]) => {
    images.forEach((img) => {
      const originalSize = img.size;
      const compression = img.isCompressed
        ? Math.round((1 - originalSize / (originalSize * 1.2)) * 100)
        : 0;
      console.log(`Image ${img.file.name}: ${compression}% compressed`);
    });
  };

  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-xl font-semibold mb-4">With Compression</h2>
      <ImageUpload
        onUpload={handleUpload}
        enableCompression={true}
        compressionQuality={0.75}
        maxFiles={10}
      />
    </div>
  );
}

// Example 4: Using useImageUpload Hook
export function HookExample() {
  const {
    images,
    isLoading,
    error,
    removeImage,
    uploadImages,
    clearAll,
    updateImageProgress,
  } = useImageUpload();

  const handleSimulatedUpload = async (uploadedImages: UploadedImage[]) => {
    await uploadImages(async (imagesToUpload) => {
      for (const image of imagesToUpload) {
        // Simulate progress updates
        for (let progress = 0; progress <= 100; progress += 10) {
          updateImageProgress(image.id, progress);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    });
  };

  return (
    <div className="p-6 border rounded-lg space-y-4">
      <h2 className="text-xl font-semibold">With Hook Management</h2>

      <ImageUpload
        onUpload={handleSimulatedUpload}
        onRemove={removeImage}
        disabled={isLoading}
        maxFiles={10}
      />

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">Error: {error}</div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id} className="border rounded p-3">
            <img
              src={image.preview}
              alt={image.file.name}
              className="w-full h-32 object-cover rounded mb-2"
            />
            <p className="text-sm truncate">{image.file.name}</p>
            <p className="text-xs text-gray-500">
              {(image.size / 1024).toFixed(2)} KB
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={clearAll}
          disabled={images.length === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Clear All
        </button>
        <button
          onClick={() => handleSimulatedUpload(images)}
          disabled={images.length === 0 || isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {isLoading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
}

// Example 5: Single Image Profile Picture
export function ProfilePictureExample() {
  const [profile, setProfile] = useState<UploadedImage | null>(null);

  const handleUpload = async (images: UploadedImage[]) => {
    if (images.length > 0) {
      // Take only the first/latest image
      setProfile(images[0]);
      console.log('Profile picture updated');
    }
  };

  return (
    <div className="p-6 border rounded-lg space-y-4">
      <h2 className="text-xl font-semibold">Profile Picture Upload</h2>

      {profile ? (
        <div className="flex gap-4">
          <img
            src={profile.preview}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover"
          />
          <div>
            <p className="font-medium">{profile.file.name}</p>
            <p className="text-sm text-gray-500">
              {(profile.size / 1024).toFixed(2)} KB
            </p>
            <button
              onClick={() =>
                setProfile(null)
              }
              className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <ImageUpload
          onUpload={handleUpload}
          validationOptions={{
            maxFileSize: 2 * 1024 * 1024,
            allowedTypes: ['image/jpeg', 'image/png'],
            maxDimensions: { width: 1000, height: 1000 },
          }}
          maxFiles={1}
          multiple={false}
          enableCompression={true}
        />
      )}
    </div>
  );
}

// Example 6: Gallery with Remove
export function GalleryExample() {
  const { images, removeImage } = useImageUpload();

  const handleUpload = (uploadedImages: UploadedImage[]) => {
    console.log('Gallery updated with', uploadedImages.length, 'new images');
  };

  return (
    <div className="p-6 border rounded-lg space-y-4">
      <h2 className="text-xl font-semibold">Gallery Upload</h2>

      <ImageUpload
        onUpload={handleUpload}
        onRemove={removeImage}
        maxFiles={20}
        multiple={true}
      />

      {images.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">
            Gallery ({images.length} images)
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.preview}
                  alt="gallery"
                  className="w-full aspect-square object-cover rounded"
                />
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const sampleGalleryImages = [
  {
    src: 'https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=320&q=60',
    alt: 'Support team working on a community project',
    caption: 'Community volunteers renovating a neighborhood space.',
  },
  {
    src: 'https://images.unsplash.com/photo-1542567457-18c6695b17d1?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1542567457-18c6695b17d1?auto=format&fit=crop&w=320&q=60',
    alt: 'Project planning discussion',
    caption: 'Project stakeholders plan a future donation drive.',
  },
  {
    src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=320&q=60',
    alt: 'Young people planting trees',
    caption: 'Funded initiative for local tree planting and education.',
  },
  {
    src: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=320&q=60',
    alt: 'Hands working on a laptop',
    caption: 'Remote collaboration across the donation platform.',
  },
];

export function ProjectGalleryDemo() {
  return (
    <div className="p-6 border rounded-lg space-y-4">
      <h2 className="text-xl font-semibold">Project Photo Gallery</h2>
      <p className="text-sm text-gray-600">Browse project photos with thumbnails, captions, zoom, and lightbox navigation.</p>
      <ImageGallery images={sampleGalleryImages} />
    </div>
  );
}

// Example 7: Disabled State
export function DisabledStateExample() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = async (images: UploadedImage[]) => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
  };

  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Disabled During Processing</h2>
      <ImageUpload
        onUpload={handleUpload}
        disabled={isProcessing}
        showPreview={!isProcessing}
      />
      {isProcessing && <p className="mt-4 text-blue-600">Processing...</p>}
    </div>
  );
}

/**
 * Gallery of all examples
 */
export default function ExamplesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          ImageUpload Examples
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Explore different usage patterns and configurations
        </p>

        <div className="grid grid-cols-1 gap-8">
          <SimpleUploadExample />
          <CustomValidationExample />
          <CompressionExample />
          <HookExample />
          <ProfilePictureExample />
          <GalleryExample />
          <DisabledStateExample />
        </div>
      </div>
    </div>
  );
}
