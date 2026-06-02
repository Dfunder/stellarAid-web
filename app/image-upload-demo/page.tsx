'use client';

import React, { useState } from 'react';
import { CampaignCoverUpload } from '@/components/campaigns/CampaignCoverUpload';
import { useCampaignCoverUpload } from '@/hooks/useCampaignCoverUpload';

/**
 * Campaign Cover Upload Example Page
 * 
 * Demonstrates the CampaignCoverUpload component with various configurations.
 * This is a demo page to test the cover image upload feature.
 */
export default function CampaignCoverUploadExample() {
  const {
    image,
    error,
    handleUploadComplete,
    handleUploadError,
    clearImage,
  } = useCampaignCoverUpload();

  const [campaignData, setCampaignData] = useState({
    title: '',
    description: '',
    goal: '',
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.currentTarget;
    setCampaignData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image?.url) {
      alert('Please upload a cover image first');
      return;
    }

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...campaignData,
          coverImageUrl: image.url,
          coverImagePublicId: image.publicId,
        }),
      });

      if (response.ok) {
        alert('Campaign created successfully!');
        setCampaignData({ title: '', description: '', goal: '' });
        clearImage();
      } else {
        alert('Failed to create campaign');
      }
    } catch (err) {
      console.error('Error creating campaign:', err);
      alert('Error creating campaign');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create a New Campaign
          </h1>
          <p className="text-lg text-gray-600">
            Upload a high-quality cover image for your fundraising campaign
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Campaign Cover Upload */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Campaign Cover Image *
              </label>
              <CampaignCoverUpload
                onUploadComplete={handleUploadComplete}
                onError={handleUploadError}
              />
            </div>

            {/* Image Preview */}
            {image?.url && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Image Preview
                </h3>
                <div className="rounded-lg overflow-hidden shadow-md">
                  <img
                    src={image.url}
                    alt="Campaign cover preview"
                    className="w-full h-80 object-cover"
                  />
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Public ID:</span> {image.publicId}
                  </p>
                  <p>
                    <span className="font-medium">Uploaded:</span>{' '}
                    {image.uploadedAt.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Campaign Title */}
            <div>
              <label htmlFor="title" className="block text-lg font-semibold text-gray-900 mb-2">
                Campaign Title *
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={campaignData.title}
                onChange={handleFormChange}
                placeholder="e.g., Clean Water for Rural Schools"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Campaign Description */}
            <div>
              <label htmlFor="description" className="block text-lg font-semibold text-gray-900 mb-2">
                Campaign Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={campaignData.description}
                onChange={handleFormChange}
                placeholder="Describe your campaign and its impact..."
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Funding Goal */}
            <div>
              <label htmlFor="goal" className="block text-lg font-semibold text-gray-900 mb-2">
                Funding Goal (XLM) *
              </label>
              <input
                id="goal"
                type="number"
                name="goal"
                value={campaignData.goal}
                onChange={handleFormChange}
                placeholder="e.g., 5000"
                min="1"
                step="0.01"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-medium">Error: {error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={!image?.url}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
              >
                Create Campaign
              </button>
              {image?.url && (
                <button
                  type="button"
                  onClick={() => {
                    clearImage();
                    setCampaignData({ title: '', description: '', goal: '' });
                  }}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                >
                  Reset Form
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">📸 High-Quality Images</h3>
            <p className="text-sm text-blue-800">
              Use clear, vibrant images that represent your campaign well. Images will be automatically optimized.
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">✓ Exact Aspect Ratio</h3>
            <p className="text-sm text-green-800">
              Make sure your image has a 16:9 aspect ratio. Tools like Canva make this easy.
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-2">⚡ Fast Upload</h3>
            <p className="text-sm text-purple-800">
              Images are uploaded securely to Cloudinary and served globally via CDN.
            </p>
          </div>
        </div>

        {/* Requirements */}
        <div className="mt-8 bg-gray-50 rounded-lg p-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-600 mr-3 font-bold">✓</span>
              <span><strong>Aspect Ratio:</strong> 16:9 (e.g., 1920×1080, 1280×720)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-3 font-bold">✓</span>
              <span><strong>File Size:</strong> Maximum 5MB</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-3 font-bold">✓</span>
              <span><strong>Formats:</strong> JPG, PNG, WebP</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-3 font-bold">✓</span>
              <span><strong>Content:</strong> Should represent your campaign and attract donors</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
