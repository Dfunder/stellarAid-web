# Campaign Cover Image Upload - Quick Start Guide

## 🚀 Installation Complete

The campaign cover image upload feature with Cloudinary integration is now fully implemented and ready to use.

### Package Installed
- ✅ `next-cloudinary` - Cloudinary SDK for Next.js

### Files Created

#### Core Files
- ✅ `lib/api/cloudinary.ts` - Cloudinary API utilities
- ✅ `components/campaigns/CampaignCoverUpload.tsx` - Main upload component
- ✅ `hooks/useCampaignCoverUpload.ts` - State management hook
- ✅ `app/api/cloudinary/delete.ts` - Server-side deletion endpoint

#### Configuration
- ✅ `lib/env.ts` - Updated with Cloudinary env variables
- ✅ `.env.example.cloudinary` - Environment template

#### Documentation & Examples
- ✅ `docs/CAMPAIGN_COVER_UPLOAD.md` - Comprehensive documentation
- ✅ `app/image-upload-demo/page.tsx` - Full working example

---

## 🔧 Setup (Required)

### 1. Create Cloudinary Account
1. Go to https://cloudinary.com/console
2. Sign up (free tier is sufficient for testing)
3. Get your **Cloud Name** from the dashboard

### 2. Create Unsigned Upload Preset
1. Dashboard → Settings → Upload tab
2. Click "Add upload preset"
3. Set **Signing Mode** to "Unsigned"
4. Name it: `stellaraid_campaigns`
5. Save and copy the preset name

### 3. Get API Credentials
1. Dashboard → Settings → API Keys
2. Copy your **API Key**
3. Get your **API Secret** (keep this private!)

### 4. Update Environment Variables
Add to `.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=stellaraid_campaigns
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 💻 Usage

### Basic Example

```tsx
import { CampaignCoverUpload } from '@/components/campaigns/CampaignCoverUpload';
import { useCampaignCoverUpload } from '@/hooks/useCampaignCoverUpload';

export function CreateCampaign() {
  const { image, error, handleUploadComplete, handleUploadError } = 
    useCampaignCoverUpload();

  return (
    <form>
      <CampaignCoverUpload
        onUploadComplete={handleUploadComplete}
        onError={handleUploadError}
      />
      
      {image && <img src={image.url} alt="Preview" />}
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
```

### Test the Demo
Visit `http://localhost:3000/image-upload-demo` after running `npm run dev`

---

## ✨ Features

### Image Validation
- **Formats**: JPG, PNG, WebP
- **Max Size**: 5MB
- **Aspect Ratio**: 16:9 (enforced with ±5% tolerance)
- **Real-time validation** with helpful error messages

### User Experience
- ✅ Drag-and-drop interface
- ✅ Click to select files
- ✅ Upload progress bar
- ✅ Image preview
- ✅ Success/error states
- ✅ Responsive design

### Performance
- ✅ Auto-optimized images via Cloudinary
- ✅ Global CDN delivery
- ✅ WebP/AVIF format support
- ✅ Automatic quality adjustment
- ✅ Fast upload with progress tracking

---

## 📁 Component API

### CampaignCoverUpload Component

```tsx
<CampaignCoverUpload
  onUploadComplete={(url, publicId) => {}}
  onError={(error) => {}}
  disabled={false}
  className="custom-class"
/>
```

**Props:**
- `onUploadComplete`: Called when image uploads successfully
- `onError`: Called when error occurs
- `disabled`: Disable the component
- `className`: Additional CSS classes

### useCampaignCoverUpload Hook

```tsx
const {
  image,                    // { id, url, publicId, uploadedAt }
  isUploading,             // boolean
  error,                   // string | null
  handleUploadComplete,    // callback
  handleUploadError,       // callback
  clearImage,              // function
  reset,                   // function
} = useCampaignCoverUpload();
```

---

## 🧪 Testing

### Test with Demo Page
```bash
npm run dev
# Visit http://localhost:3000/image-upload-demo
```

### Test Image Requirements
Use a 16:9 image:
- **1920×1080** (Full HD)
- **1280×720** (HD)
- **640×360** (Small)

### Generate Test Images
- [Canva](https://canva.com) - Free 16:9 templates
- [Unsplash](https://unsplash.com) - Free stock photos
- [Pexels](https://pexels.com) - Free stock photos

---

## 🔒 Security

### Client-Side (Unsigned)
- Uses unsigned upload preset (safe for client-side)
- No API credentials exposed
- Automatic validation

### Server-Side (Signed)
- Image deletion uses signed requests
- Requires API secret (keep in .env only)
- `/api/cloudinary/delete` endpoint

---

## 📚 Additional Resources

- [Full Documentation](docs/CAMPAIGN_COVER_UPLOAD.md)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Next.js Image Optimization](https://nextjs.org/docs/pages/building-your-application/optimizing/images)

---

## ✅ Verification Checklist

- [ ] Cloudinary account created
- [ ] Upload preset configured
- [ ] API credentials obtained
- [ ] `.env.local` updated with credentials
- [ ] Run `npm run dev` to start dev server
- [ ] Visit `/image-upload-demo` to test
- [ ] Upload a test image
- [ ] Verify image displays correctly
- [ ] Check Cloudinary dashboard for uploaded image

---

## 🆘 Troubleshooting

### "Cloudinary credentials not configured"
- Check `.env.local` has all required variables
- Ensure variable names are exact (case-sensitive)
- Restart dev server after updating `.env`

### "Image aspect ratio must be 16:9"
- Use Canva or image editor to crop to 16:9
- Ensure image dimensions are exactly 16:9 (e.g., 1920×1080)

### "File size exceeds maximum"
- Compress image using ImageOptim or TinyPNG
- Max size is 5MB

### Upload fails silently
- Check browser console (F12) for errors
- Verify upload preset is set to "Unsigned"
- Confirm Cloudinary Cloud Name is correct

---

## 📞 Next Steps

1. **Integrate into campaign creation form** - Add to your campaign creation page
2. **Store image URL in database** - Save the Cloudinary URL with campaign data
3. **Add image deletion** - Clean up images when campaigns are deleted
4. **Customize styling** - Modify the component's appearance to match your design
5. **Add image cropping** - Let users crop images before upload (optional enhancement)

---

## 🎉 You're All Set!

The campaign cover image upload feature is ready to use. Start by visiting the demo page and then integrate it into your campaign creation workflow.

For questions, refer to the [full documentation](docs/CAMPAIGN_COVER_UPLOAD.md).
