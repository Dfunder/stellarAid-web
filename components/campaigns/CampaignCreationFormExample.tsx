/**
 * Example: Integrating CampaignCoverUpload into a Campaign Form
 * 
 * This example shows how to integrate the campaign cover upload component
 * into a complete campaign creation form with validation and submission.
 */

'use client';

import React, { useState } from 'react';
import { CampaignCoverUpload } from '@/components/campaigns/CampaignCoverUpload';
import { useCampaignCoverUpload } from '@/hooks/useCampaignCoverUpload';

interface CampaignFormData {
  title: string;
  description: string;
  goal: number;
  category: string;
  coverImageUrl: string;
  coverImagePublicId: string;
}

export function CampaignCreationForm() {
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    description: '',
    goal: 0,
    category: '',
    coverImageUrl: '',
    coverImagePublicId: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { image, error: uploadError, handleUploadComplete, handleUploadError } =
    useCampaignCoverUpload();

  // Handle form field changes
  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'goal' ? parseFloat(value) || 0 : value,
    }));
  };

  // Handle upload completion
  const handleImageUpload = (imageUrl: string, publicId: string) => {
    setFormData((prev) => ({
      ...prev,
      coverImageUrl: imageUrl,
      coverImagePublicId: publicId,
    }));
    handleUploadComplete(imageUrl, publicId);
  };

  // Validate form before submission
  const validateForm = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push('Campaign title is required');
    }

    if (!formData.description.trim()) {
      errors.push('Campaign description is required');
    }

    if (formData.goal <= 0) {
      errors.push('Funding goal must be greater than 0');
    }

    if (!formData.category) {
      errors.push('Please select a category');
    }

    if (!formData.coverImageUrl) {
      errors.push('Please upload a cover image');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    // Validate form
    const validation = validateForm();
    if (!validation.valid) {
      setSubmitError(validation.errors.join(', '));
      return;
    }

    try {
      setIsSubmitting(true);

      // Submit to backend API
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          goal: formData.goal,
          category: formData.category,
          coverImage: {
            url: formData.coverImageUrl,
            publicId: formData.coverImagePublicId,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create campaign');
      }

      const result = await response.json();

      setSubmitSuccess(true);
      // Reset form
      setFormData({
        title: '',
        description: '',
        goal: 0,
        category: '',
        coverImageUrl: '',
        coverImagePublicId: '',
      });

      // Redirect or show success message
      console.log('Campaign created successfully:', result);
      // Example: router.push(`/campaigns/${result.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Create a Campaign</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Campaign Cover Image */}
        <div className="space-y-3">
          <label className="block text-lg font-semibold text-gray-900">
            Campaign Cover Image *
          </label>
          <p className="text-sm text-gray-600">
            Upload a high-quality image in 16:9 aspect ratio (e.g., 1920×1080)
          </p>
          <CampaignCoverUpload
            onUploadComplete={handleImageUpload}
            onError={handleUploadError}
          />
          {uploadError && (
            <p className="text-sm text-red-600 mt-2">Error: {uploadError}</p>
          )}
        </div>

        {/* Campaign Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-lg font-semibold text-gray-900">
            Campaign Title *
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleFieldChange}
            placeholder="e.g., Clean Water for Rural Schools"
            maxLength={100}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500">{formData.title.length}/100</p>
        </div>

        {/* Campaign Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-lg font-semibold text-gray-900">
            Campaign Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleFieldChange}
            placeholder="Describe your campaign, its goals, and impact..."
            rows={6}
            maxLength={1000}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500">{formData.description.length}/1000</p>
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <label htmlFor="category" className="block text-lg font-semibold text-gray-900">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleFieldChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a category</option>
            <option value="education">Education</option>
            <option value="healthcare">Healthcare</option>
            <option value="environment">Environment</option>
            <option value="community">Community</option>
            <option value="emergency">Emergency Relief</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Funding Goal */}
        <div className="space-y-2">
          <label htmlFor="goal" className="block text-lg font-semibold text-gray-900">
            Funding Goal (XLM) *
          </label>
          <input
            id="goal"
            type="number"
            name="goal"
            value={formData.goal || ''}
            onChange={handleFieldChange}
            placeholder="e.g., 5000"
            min="1"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500">Minimum: 1 XLM</p>
        </div>

        {/* Image Preview */}
        {image?.url && (
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900">Image Preview</h3>
            <img
              src={image.url}
              alt="Campaign cover preview"
              className="w-full h-64 object-cover rounded-lg"
            />
            <p className="text-sm text-blue-800">
              ✓ Image uploaded successfully and will be used as your campaign cover
            </p>
          </div>
        )}

        {/* Error Messages */}
        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{submitError}</p>
          </div>
        )}

        {/* Success Message */}
        {submitSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">
              ✓ Campaign created successfully!
            </p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting || !formData.coverImageUrl}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
          >
            {isSubmitting ? 'Creating Campaign...' : 'Create Campaign'}
          </button>
          <button
            type="reset"
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✓ Cover image must be in 16:9 aspect ratio</li>
          <li>✓ Maximum file size: 5MB</li>
          <li>✓ Supported formats: JPG, PNG, WebP</li>
          <li>✓ Campaign title: max 100 characters</li>
          <li>✓ Campaign description: max 1000 characters</li>
          <li>✓ Funding goal: minimum 1 XLM</li>
        </ul>
      </div>
    </div>
  );
}
