# Campaign Cover Image Upload

This document describes the campaign cover image upload feature with Cloudinary integration.

## Features

- ✅ Drag-and-drop + file picker interface
- ✅ Image validation (format, size, aspect ratio)
- ✅ Real-time upload progress tracking
- ✅ Cloudinary optimization and delivery
- ✅ Supported formats: JPG, PNG, WebP
- ✅ Max file size: 5MB
- ✅ Enforced aspect ratio: 16:9

## Setup

### 1. Install Dependencies

```bash
npm install next-cloudinary
```

### 2. Configure Environment Variables

Add the following to your `.env.local`:

```env
# Cloudinary configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset

# Server-side (for image deletion)
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

To get these values:
1. Create a Cloudinary account at https://cloudinary.com
2. Go to Dashboard → Settings → Upload
3. Create an unsigned upload preset (allows client-side uploads)
4. Copy your Cloud Name and API Key

### 3. Create Unsigned Upload Preset

1. In Cloudinary Dashboard, go to Settings → Upload
2. Click "Add upload preset"
3. Set Signing Mode to "Unsigned"
4. Name it something like `stellaraid_campaigns`
5. Under Allowed transformations, enable all transformations
6. Save and use the preset name in your environment variables

## Usage

### Basic Implementation

```tsx
'use client';

import { CampaignCoverUpload } from '@/components/campaigns/CampaignCoverUpload';
import { useCampaignCoverUpload } from '@/hooks/useCampaignCoverUpload';

export function CampaignForm() {
  const { image, error, handleUploadComplete, handleUploadError } =
    useCampaignCoverUpload();

  return (
    <form>
      <CampaignCoverUpload
        onUploadComplete={handleUploadComplete}
        onError={handleUploadError}
      />

      {image && (
        <div>
          <p>Image uploaded: {image.url}</p>
          <img src={image.url} alt="Campaign cover" className="w-full h-64 object-cover" />
        </div>
      )}

      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
```

### With Form Integration

```tsx
import { CampaignCoverUpload } from '@/components/campaigns/CampaignCoverUpload';
import { useCampaignCoverUpload } from '@/hooks/useCampaignCoverUpload';

export function CreateCampaignForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImageUrl: '',
    coverImagePublicId: '',
  });

  const { image } = useCampaignCoverUpload();

  const handleUploadComplete = (imageUrl: string, publicId: string) => {
    setFormData((prev) => ({
      ...prev,
      coverImageUrl: imageUrl,
      coverImagePublicId: publicId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.coverImageUrl) {
      alert('Please upload a cover image');
      return;
    }

    // Submit form with image data
    await fetch('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Campaign title"
        value={formData.title}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, title: e.target.value }))
        }
      />

      <CampaignCoverUpload
        onUploadComplete={handleUploadComplete}
        onError={(error) => console.error(error)}
      />

      <button type="submit">Create Campaign</button>
    </form>
  );
}
```

## Component API

### CampaignCoverUpload Props

```tsx
interface CampaignCoverUploadProps {
  onUploadComplete?: (imageUrl: string, publicId: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}
```

- **onUploadComplete**: Called when image is successfully uploaded
- **onError**: Called when an error occurs during upload
- **disabled**: Disable the upload component
- **className**: Additional CSS classes to apply

### useCampaignCoverUpload Hook

```tsx
const {
  image, // Current uploaded image
  isUploading, // Upload in progress
  error, // Error message
  setImage,
  setError,
  setIsUploading,
  handleUploadComplete,
  handleUploadError,
  clearImage,
  reset,
} = useCampaignCoverUpload();
```

## API Routes

### DELETE `/api/cloudinary/delete`

Delete an image from Cloudinary (server-side).

**Request:**
```json
{
  "publicId": "stellaraid/campaigns/abc123"
}
```

**Response:**
```json
{
  "message": "Image deleted successfully",
  "result": { ... }
}
```

## Utilities

### uploadToCloudinary

Upload image to Cloudinary with automatic transformations.

```tsx
import { uploadToCloudinary } from '@/lib/api/cloudinary';

const response = await uploadToCloudinary(file, {
  folder: 'stellaraid/campaigns',
});

console.log(response.secure_url);
```

### getCloudinaryUrl

Generate an optimized Cloudinary URL.

```tsx
import { getCloudinaryUrl } from '@/lib/api/cloudinary';

const url = getCloudinaryUrl(publicId, {
  width: 1920,
  height: 1080,
  quality: 'auto',
  format: 'auto',
});
```

### validateAspectRatio

Validate if image has 16:9 aspect ratio.

```tsx
import { validateAspectRatio } from '@/lib/api/cloudinary';

const isValid = validateAspectRatio(1920, 1080);
```

### getImageDimensions

Get image dimensions from file.

```tsx
import { getImageDimensions } from '@/lib/api/cloudinary';

const { width, height } = await getImageDimensions(file);
```

## Validation Rules

- **Aspect Ratio**: Must be 16:9 (tolerance: ±5%)
- **File Formats**: JPG, PNG, WebP
- **Max File Size**: 5MB
- **Accepted MIME Types**: image/jpeg, image/png, image/webp

## Error Handling

The component handles the following errors:

1. **Invalid Format**: User selects unsupported file type
2. **File Too Large**: File exceeds 5MB limit
3. **Invalid Aspect Ratio**: Image is not 16:9
4. **Upload Failed**: Network or server error during upload

## Security Considerations

- Use unsigned upload presets for client-side uploads (more secure)
- Server-side deletion requires API key & secret
- All transformations are defined server-side
- Cloudinary handles malicious file detection

## Performance Optimization

- Images are optimized automatically by Cloudinary
- Supported formats: JPEG, PNG, WebP, AVIF
- Automatic quality adjustment
- CDN delivery across global network

## Troubleshooting

### "Cloudinary credentials not configured"
Make sure `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` are set in `.env.local`.

### "Image aspect ratio must be 16:9"
Ensure your image has exactly 16:9 aspect ratio. Use an image editor to crop if needed.

### "File size exceeds maximum of 5MB"
Compress your image before uploading. Use tools like TinyPNG or ImageOptim.

### Upload fails silently
Check browser console for error messages. Verify Cloudinary credentials and upload preset are correct.

## References

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Next.js Image Optimization](https://nextjs.org/docs/pages/building-your-application/optimizing/images)
- [Image Aspect Ratios](https://en.wikipedia.org/wiki/Aspect_ratio_%28image%29)
