'use client';

import { useState, useRef } from 'react';
import { ImageUpload, UploadedImage } from '@/components/ImageUpload';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

/**
 * ImageUploadDemo Page
 *
 * Demonstrates all features of the ImageUpload component
 */
export default function ImageUploadDemoPage() {
  const imageUploadRef = useRef(null);
  const {
    images,
    isLoading,
    error,
    removeImage,
    updateImageProgress,
    setImageError,
    clearAll,
  } = useImageUpload();

  const [uploadMode, setUploadMode] = useState<'local' | 'server'>('local');

  /**
   * Simulates image upload with progress tracking
   */
  const simulateUpload = async (uploadedImages: UploadedImage[]) => {
    for (const image of uploadedImages) {
      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 25) {
          updateImageProgress(image.id, progress);
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      } catch (err) {
        setImageError(image.id, err);
      }
    }
  };

  /**
   * Real API upload (example)
   */
  const uploadToServer = async (uploadedImages: UploadedImage[]) => {
    for (const image of uploadedImages) {
      try {
        const formData = new FormData();
        formData.append('file', image.file);

        // Example API call (replace with actual endpoint)
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        // Mark as complete
        updateImageProgress(image.id, 100);
      } catch (err) {
        setImageError(image.id, err);
      }
    }
  };

  const handleUpload = (uploadedImages: UploadedImage[]) => {
    if (uploadMode === 'local') {
      return simulateUpload(uploadedImages);
    } else {
      return uploadToServer(uploadedImages);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Image Upload Component
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            A comprehensive, reusable image upload component with preview,
            validation, and compression
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Area - Main Column */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Upload Images
                </h2>

                {/* Upload Mode Toggle */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setUploadMode('local')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      uploadMode === 'local'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    Simulate Upload
                  </button>
                  <button
                    onClick={() => setUploadMode('server')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      uploadMode === 'server'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    Server Upload
                  </button>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                )}
              </div>

              {/* Image Upload Component */}
              <ImageUpload
                ref={imageUploadRef}
                onUpload={handleUpload}
                onRemove={removeImage}
                maxFiles={10}
                multiple={true}
                disabled={isLoading}
                validationOptions={{
                  maxFileSize: 5 * 1024 * 1024, // 5MB
                  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
                  maxDimensions: { width: 4000, height: 4000 },
                }}
                showPreview={true}
                showProgress={true}
                enableCompression={true}
                compressionQuality={0.85}
              />

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <Button
                  onClick={clearAll}
                  disabled={images.length === 0 || isLoading}
                  variant="outline"
                >
                  Clear All
                </Button>
                <Button disabled={images.length === 0} isLoading={isLoading}>
                  {isLoading ? 'Uploading...' : 'Upload Selected Images'}
                </Button>
              </div>
            </Card>
          </div>

          {/* Information Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Statistics
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Images Selected
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {images.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Size
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {(
                      images.reduce((sum, img) => sum + img.size, 0) /
                      1024 /
                      1024
                    ).toFixed(2)}{' '}
                    MB
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Compressed
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {images.filter((img) => img.isCompressed).length}
                  </p>
                </div>
              </div>
            </Card>

            {/* Features Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Drag-and-drop support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Click to browse</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Image previews</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Delete functionality</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Validation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Progress tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Multiple files</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Error handling</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Image compression</span>
                </li>
              </ul>
            </Card>

            {/* Usage Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Start
              </h3>
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto">
                <code>
{`import { ImageUpload } from '@/components/ImageUpload';
import { useImageUpload } from '@/hooks/useImageUpload';

export default function MyComponent() {
  const { images, removeImage } = 
    useImageUpload();

  return (
    <ImageUpload
      onUpload={handleUpload}
      onRemove={removeImage}
      maxFiles={10}
      multiple={true}
      validationOptions={{
        maxFileSize: 5 * 1024 * 1024,
        allowedTypes: [
          'image/jpeg',
          'image/png'
        ]
      }}
      enableCompression={true}
    />
  );
}`}
                </code>
              </pre>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
