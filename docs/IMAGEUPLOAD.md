# ImageUpload Component Documentation

A comprehensive, reusable image upload component for Next.js applications with support for drag-and-drop, validation, compression, and progress tracking.

## Features

✅ **Drag-and-Drop Support** - Intuitive drag-and-drop interface  
✅ **Click to Browse** - Traditional file picker  
✅ **Image Previews** - Thumbnail previews of uploaded images  
✅ **Delete Functionality** - Remove individual images  
✅ **File Validation** - Type and size validation  
✅ **Progress Tracking** - Visual upload progress bars  
✅ **Multiple Files** - Support for uploading multiple images  
✅ **Error Handling** - User-friendly error messages  
✅ **Image Compression** - Optional compression before upload  
✅ **Dimension Validation** - Validate image dimensions  
✅ **Dark Mode** - Full dark mode support  
✅ **TypeScript** - Fully typed for better DX  

## Installation

The component is ready to use in your project. No additional packages needed beyond what's already in your `package.json`.

## Basic Usage

```tsx
import { ImageUpload } from '@/components/ImageUpload';

export default function MyComponent() {
  const handleUpload = async (images) => {
    // Handle upload logic
    console.log('Uploading:', images);
  };

  return (
    <ImageUpload
      onUpload={handleUpload}
      maxFiles={5}
      multiple={true}
    />
  );
}
```

## Component Props

### ImageUploadProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onUpload` | `(files: UploadedImage[]) => Promise<void> \| void` | `undefined` | Callback when files are selected for upload |
| `onRemove` | `(id: string) => void` | `undefined` | Callback when an image is removed |
| `maxFiles` | `number` | `10` | Maximum number of files allowed |
| `multiple` | `boolean` | `true` | Allow multiple file selection |
| `disabled` | `boolean` | `false` | Disable the upload component |
| `className` | `string` | `undefined` | Additional CSS classes |
| `validationOptions` | `ImageValidationOptions` | See below | File validation settings |
| `showPreview` | `boolean` | `true` | Show image previews |
| `showProgress` | `boolean` | `true` | Show upload progress bars |
| `enableCompression` | `boolean` | `false` | Enable image compression |
| `compressionQuality` | `number` | `0.8` | Compression quality (0-1) |

### ImageValidationOptions

```ts
interface ImageValidationOptions {
  maxFileSize?: number;        // in bytes (default: 5MB)
  allowedTypes?: string[];     // MIME types
  maxDimensions?: {
    width: number;
    height: number;
  };
}
```

## UploadedImage Interface

```ts
interface UploadedImage {
  id: string;                    // Unique identifier
  file: File;                    // File object
  preview: string;               // Object URL for preview
  size: number;                  // File size in bytes
  uploadProgress?: number;       // Upload progress (0-100)
  error?: ImageUploadError;      // Error details if any
  isCompressed?: boolean;        // Whether image was compressed
}
```

## Advanced Usage with useImageUpload Hook

```tsx
'use client';

import { ImageUpload } from '@/components/ImageUpload';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Button } from '@/components/ui/Button';

export default function ImageManager() {
  const {
    images,
    isLoading,
    error,
    addImages,
    removeImage,
    updateImageProgress,
    setImageError,
    uploadImages,
    clearAll,
  } = useImageUpload();

  const handleUpload = async (uploadedImages) => {
    await uploadImages(async (imagesToUpload) => {
      for (const image of imagesToUpload) {
        try {
          const formData = new FormData();
          formData.append('file', image.file);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) throw new Error('Upload failed');

          // Track progress
          updateImageProgress(image.id, 100);
        } catch (err) {
          setImageError(image.id, err);
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <ImageUpload
        onUpload={handleUpload}
        onRemove={removeImage}
        maxFiles={10}
      />

      {error && (
        <div className="p-4 bg-red-50 rounded text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={clearAll} disabled={images.length === 0}>
          Clear All ({images.length})
        </Button>
      </div>

      {/* Display uploaded images info */}
      <div className="grid grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id} className="border rounded p-2">
            <img src={image.preview} alt="preview" />
            <p className="text-sm">{image.file.name}</p>
            {image.error && <p className="text-red-500">{image.error.message}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Validation Examples

### Standard Web Images (Default)

```tsx
<ImageUpload
  validationOptions={{
    maxFileSize: 5 * 1024 * 1024,    // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxDimensions: { width: 4000, height: 4000 }
  }}
/>
```

### Profile Pictures

```tsx
<ImageUpload
  validationOptions={{
    maxFileSize: 2 * 1024 * 1024,    // 2MB
    allowedTypes: ['image/jpeg', 'image/png'],
    maxDimensions: { width: 1000, height: 1000 }
  }}
  maxFiles={1}
  multiple={false}
/>
```

### Gallery Images with Compression

```tsx
<ImageUpload
  validationOptions={{
    maxFileSize: 10 * 1024 * 1024,   // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxDimensions: { width: 3000, height: 3000 }
  }}
  enableCompression={true}
  compressionQuality={0.85}
  maxFiles={20}
/>
```

## Utility Functions

The `imageUpload` utility module provides several helper functions:

### validateImageFile

```ts
import { validateImageFile, ImageValidationOptions } from '@/utils/imageUpload';

const error = validateImageFile(file, options);
if (error) {
  console.error(error.message);
}
```

### validateImageDimensions

```ts
import { validateImageDimensions } from '@/utils/imageUpload';

const error = await validateImageDimensions(file, options);
```

### compressImage

```ts
import { compressImage } from '@/utils/imageUpload';

const compressedFile = await compressImage(file, quality);
```

### formatFileSize

```ts
import { formatFileSize } from '@/utils/imageUpload';

console.log(formatFileSize(5242880)); // "5 MB"
```

### generateImagePreview / revokeImagePreview

```ts
import { generateImagePreview, revokeImagePreview } from '@/utils/imageUpload';

const url = generateImagePreview(file);
// ... use url for img src
revokeImagePreview(url); // Clean up when done
```

## Server-Side Upload Example

```ts
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(process.cwd(), 'public/uploads', filename);

    await fs.writeFile(filepath, Buffer.from(buffer));

    return NextResponse.json({
      success: true,
      filename,
      url: `/uploads/${filename}`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

## Styling & Customization

The component uses Tailwind CSS and supports dark mode. Customize appearance by:

1. **Using the `className` prop:**
```tsx
<ImageUpload
  className="max-w-md"
/>
```

2. **Extending with custom CSS:**
```css
/* Your custom styles */
.custom-upload {
  /* Custom styling */
}
```

## Error Handling

The component handles various error states:

- **Invalid File Type** - Shows clear message about allowed types
- **File Size Exceeded** - Displays maximum allowed size
- **Invalid Dimensions** - Notifies of dimension limits
- **Upload Errors** - Displays error state on individual images
- **Validation Errors** - Logged to console for debugging

## Accessibility

The component includes:
- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader friendly error messages

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Performance Considerations

1. **Image Compression** - Reduces file sizes before upload
2. **Object URL Management** - Properly revokes URLs to free memory
3. **Lazy Loading** - Previews load on demand
4. **Memoization** - Uses callbacks to prevent unnecessary re-renders

## TypeScript Support

Full TypeScript support with exported types:

```ts
import type { ImageUploadProps, UploadedImage } from '@/components/ImageUpload';
```

## Common Patterns

### Single File Upload
```tsx
<ImageUpload
  maxFiles={1}
  multiple={false}
  // ... other props
/>
```

### Disabled State
```tsx
<ImageUpload
  disabled={isLoading}
  // ... other props
/>
```

### Custom Callbacks
```tsx
<ImageUpload
  onUpload={async (images) => {
    console.log('Uploading:', images);
    // Your upload logic
  }}
  onRemove={(id) => {
    console.log('Removed:', id);
  }}
/>
```

## Troubleshooting

**Images not previewing?**
- Check browser permissions for file access
- Ensure FileReader API is supported

**Compression not working?**
- Verify browser supports Canvas API
- Check format is JPEG (compression targets JPEG)

**Drag-and-drop not working?**
- Ensure component isn't disabled
- Check browser supports DataTransfer API

## Demo Page

A complete demo page is available at `/image-upload-demo` showing all features in action with simulated and server uploads.

## Best Practices

1. **Always validate on server** - Don't rely only on client validation
2. **Use compression wisely** - Balance quality vs file size
3. **Handle loading states** - Show feedback during upload
4. **Set reasonable limits** - Consider user bandwidth and server capacity
5. **Provide clear feedback** - Show progress and errors clearly
6. **Clean up previews** - Component handles cleanup, but be aware of memory usage

## License

This component is part of the StellarAid project.
