# Campaign Cover Image Upload - Verification Checklist

## ✅ Pre-Launch Checklist

Use this checklist to ensure the campaign cover image upload feature is properly configured and working.

---

## Step 1: Verify Installation

- [ ] **Package installed**: Check that `next-cloudinary` is in `package.json`
  ```bash
  npm list next-cloudinary
  ```

- [ ] **Dependencies resolved**: No missing dependencies
  ```bash
  npm install
  ```

---

## Step 2: Verify Environment Configuration

- [ ] **`.env.local` created** with Cloudinary credentials:
  ```
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your_value>
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<your_value>
  CLOUDINARY_API_KEY=<your_value>
  CLOUDINARY_API_SECRET=<your_value>
  ```

- [ ] **All variables are set** (no empty values)

- [ ] **Dev server restarted** after updating `.env.local`
  ```bash
  npm run dev
  ```

---

## Step 3: Verify File Structure

All required files should exist:

- [ ] `lib/api/cloudinary.ts`
- [ ] `components/campaigns/CampaignCoverUpload.tsx`
- [ ] `hooks/useCampaignCoverUpload.ts`
- [ ] `app/api/cloudinary/delete.ts`
- [ ] `lib/env.ts` (updated)
- [ ] `app/image-upload-demo/page.tsx`
- [ ] `docs/CAMPAIGN_COVER_UPLOAD.md`
- [ ] `components/campaigns/CampaignCreationFormExample.tsx`

---

## Step 4: Verify TypeScript Compilation

Run type checking:

```bash
npm run type-check
```

- [ ] **No TypeScript errors** related to the new files

---

## Step 5: Test the Demo Page

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/image-upload-demo`

3. **Visual checks**:
   - [ ] Page loads without errors
   - [ ] Upload area displays correctly
   - [ ] Drag-and-drop zone is visible
   - [ ] "Click to select" message is visible

---

## Step 6: Test Upload Functionality

1. **Prepare a test image**:
   - [ ] 16:9 aspect ratio (e.g., 1920×1080, 1280×720)
   - [ ] Supported format: JPG, PNG, or WebP
   - [ ] File size under 5MB

2. **Test drag-and-drop**:
   - [ ] Drag image into upload area
   - [ ] See preview
   - [ ] Upload progress appears
   - [ ] Upload completes successfully
   - [ ] Success message displays
   - [ ] Image URL is returned

3. **Test file picker**:
   - [ ] Click upload area to open file picker
   - [ ] Select a valid image file
   - [ ] Upload completes successfully

---

## Step 7: Test Validation

Upload invalid files and verify error handling:

1. **Invalid aspect ratio**:
   - [ ] Upload image not in 16:9 ratio (e.g., square image)
   - [ ] See error: "Image aspect ratio must be 16:9"
   - [ ] Error message is helpful

2. **Invalid format**:
   - [ ] Try uploading non-image file (e.g., `.txt`)
   - [ ] See error: "Invalid file format"
   - [ ] Only JPG/PNG/WebP are accepted

3. **File too large**:
   - [ ] Try uploading file > 5MB
   - [ ] See error: "File size exceeds maximum"
   - [ ] Helpful size info is displayed

---

## Step 8: Verify Cloudinary Integration

1. **Check Cloudinary Dashboard**:
   - [ ] Log in to https://cloudinary.com/console
   - [ ] Go to Media Library
   - [ ] See uploaded test images in `stellaraid/campaigns` folder
   - [ ] Images are accessible via CDN

2. **Verify image optimization**:
   - [ ] Images use WebP format automatically
   - [ ] Images are responsive
   - [ ] File sizes are optimized

---

## Step 9: Test Component Integration

1. **Copy example integration**:
   - [ ] Review `components/campaigns/CampaignCreationFormExample.tsx`
   - [ ] Copy relevant code to your actual campaign form

2. **Integrate into form**:
   - [ ] Add `CampaignCoverUpload` component to campaign creation page
   - [ ] Connect `useCampaignCoverUpload` hook
   - [ ] Add form submission handling
   - [ ] Capture image URL and public ID

3. **Test form submission**:
   - [ ] Upload image
   - [ ] Fill form fields
   - [ ] Submit form
   - [ ] Verify image URL is included in submission
   - [ ] Backend receives correct image data

---

## Step 10: Test API Endpoint

Test image deletion endpoint:

```bash
curl -X POST http://localhost:3000/api/cloudinary/delete \
  -H "Content-Type: application/json" \
  -d '{"publicId":"stellaraid/campaigns/test_image"}'
```

- [ ] Endpoint responds with 200 status
- [ ] Image is deleted from Cloudinary
- [ ] Image is removed from Media Library

---

## Step 11: Performance Testing

1. **Bundle size check**:
   ```bash
   npm run build
   ```
   - [ ] Build completes successfully
   - [ ] No unexpected bundle size increase

2. **Load time test**:
   - [ ] Upload demo page loads quickly
   - [ ] No console errors or warnings
   - [ ] Images load efficiently

---

## Step 12: Browser Compatibility

Test on different browsers:

- [ ] **Chrome**: Upload and preview work
- [ ] **Firefox**: Upload and preview work
- [ ] **Safari**: Upload and preview work
- [ ] **Edge**: Upload and preview work
- [ ] **Mobile browser**: Touch interactions work

---

## Step 13: Accessibility Check

- [ ] [ ] Form labels are associated with inputs
- [ ] [ ] Error messages are descriptive
- [ ] [ ] Keyboard navigation works
- [ ] [ ] Screen reader announces form fields
- [ ] [ ] Color contrast is sufficient

---

## Step 14: Security Verification

- [ ] **API credentials not exposed**:
  - `CLOUDINARY_API_SECRET` never sent to client
  - Only public environment variables in frontend

- [ ] **Server-side validation**:
  - Delete endpoint requires proper authentication
  - Consider adding auth check to `/api/cloudinary/delete`

- [ ] **Input validation**:
  - File type validation on client and server
  - File size validation enforced
  - Aspect ratio validation working

---

## Step 15: Documentation Review

- [ ] Read [CAMPAIGN_COVER_UPLOAD.md](../docs/CAMPAIGN_COVER_UPLOAD.md)
- [ ] Read [CAMPAIGN_COVER_UPLOAD_QUICKSTART.md](../CAMPAIGN_COVER_UPLOAD_QUICKSTART.md)
- [ ] Documentation is clear and complete
- [ ] All API endpoints are documented
- [ ] Examples are easy to follow

---

## Production Deployment Checklist

Before deploying to production:

- [ ] **Environment variables set**:
  - All Cloudinary credentials configured
  - API keys are from production Cloudinary account

- [ ] **Error handling comprehensive**:
  - User-friendly error messages
  - No sensitive info in error messages
  - Logging configured

- [ ] **Performance optimized**:
  - Images compressed on Cloudinary
  - CDN enabled
  - Caching headers configured

- [ ] **Security hardened**:
  - CORS properly configured
  - Upload preset is unsigned only
  - Rate limiting considered

- [ ] **Monitoring set up**:
  - Upload success/failure metrics tracked
  - Errors logged to monitoring service
  - User feedback mechanism in place

---

## Troubleshooting Guide

### Issue: "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured"
**Solution**: 
- Check `.env.local` has the variable set
- Ensure exact spelling: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- Restart dev server: `npm run dev`

### Issue: Upload fails with 401 Unauthorized
**Solution**:
- Check upload preset exists in Cloudinary
- Verify preset is set to "Unsigned"
- Confirm preset name matches `.env.local`

### Issue: "Image aspect ratio must be 16:9"
**Solution**:
- Image must be exactly 16:9 (e.g., 1920×1080)
- Use Canva to create properly sized image
- Check actual dimensions of image file

### Issue: Preview not showing after upload
**Solution**:
- Check browser console for errors
- Verify Cloudinary CDN is accessible
- Check CORS settings in Cloudinary

### Issue: Component not rendering
**Solution**:
- Verify import path is correct
- Check React version compatibility
- Ensure parent component is 'use client'

---

## Support Resources

- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Next.js Docs**: https://nextjs.org/docs
- **Component Documentation**: [docs/CAMPAIGN_COVER_UPLOAD.md](../docs/CAMPAIGN_COVER_UPLOAD.md)
- **Example Code**: `components/campaigns/CampaignCreationFormExample.tsx`

---

## Sign-Off

- [ ] **Developer**: Tested and verified all functionality
- [ ] **QA**: Tested on multiple browsers and devices
- [ ] **Product**: Verified against acceptance criteria
- [ ] **Ready for Production**: All checks passed

Date: ___________
Verified By: ___________

---

**Notes:**
```
[Add any additional notes or issues found during testing]
```
