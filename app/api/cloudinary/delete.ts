/**
 * API route for Cloudinary operations (server-side)
 * Handles deletion of images from Cloudinary with API key authentication
 */

import { NextRequest, NextResponse } from 'next/server';

interface DeleteImageRequest {
  publicId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DeleteImageRequest = await request.json();
    const { publicId } = body;

    if (!publicId) {
      return NextResponse.json(
        { message: 'Missing publicId parameter' },
        { status: 400 }
      );
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { message: 'Cloudinary credentials not configured' },
        { status: 500 }
      );
    }

    // Delete image from Cloudinary
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', apiKey);

    const timestamp = Math.floor(Date.now() / 1000);
    formData.append('timestamp', timestamp.toString());

    // Generate signature
    const crypto = await import('crypto');
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto
      .createHash('sha1')
      .update(stringToSign)
      .digest('hex');

    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to delete image');
    }

    const result = await response.json();

    return NextResponse.json(
      { message: 'Image deleted successfully', result },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message, error: message },
      { status: 500 }
    );
  }
}
