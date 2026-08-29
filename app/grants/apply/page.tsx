'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/app/store';
import {
  submitApplication,
  selectGrantsLoading,
} from '@/app/features/grants/grantsSelectors';
import { GrantApplicationFormData } from '@/app/features/grants/grantsSlice';
import { selectCurrentUser } from '@/app/features/auth/authSlice';
import Link from 'next/link';

export default function GrantApplicationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const grantId = searchParams.get('grantId');
  const loading = useSelector(selectGrantsLoading);
  const user = useSelector(selectCurrentUser);

  const [formData, setFormData] = useState<GrantApplicationFormData>({
    title: '',
    description: '',
    proposal: '',
    budget: 0,
    timeline: '',
    deliverables: [],
    portfolioLinks: [],
  });
  const [deliverableInput, setDeliverableInput] = useState('');
  const [portfolioInput, setPortfolioInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/grants/apply');
    }
  }, [user, router]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.proposal.trim()) {
      newErrors.proposal = 'Proposal is required';
    }
    if (formData.budget <= 0) {
      newErrors.budget = 'Budget must be greater than 0';
    }
    if (!formData.timeline.trim()) {
      newErrors.timeline = 'Timeline is required';
    }
    if (formData.deliverables.length === 0) {
      newErrors.deliverables = 'At least one deliverable is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    if (!grantId) {
      setErrors({ submit: 'Grant ID is missing' });
      return;
    }

    try {
      await dispatch(submitApplication({ grantId, data: formData }));
      router.push(`/grants/${grantId}`);
    } catch (error) {
      console.error('Failed to submit application:', error);
    }
  };

  const addDeliverable = () => {
    if (deliverableInput.trim()) {
      setFormData({
        ...formData,
        deliverables: [...formData.deliverables, deliverableInput.trim()],
      });
      setDeliverableInput('');
    }
  };

  const removeDeliverable = (index: number) => {
    setFormData({
      ...formData,
      deliverables: formData.deliverables.filter((_, i) => i !== index),
    });
  };

  const addPortfolioLink = () => {
    if (portfolioInput.trim()) {
      setFormData({
        ...formData,
        portfolioLinks: [...(formData.portfolioLinks || []), portfolioInput.trim()],
      });
      setPortfolioInput('');
    }
  };

  const removePortfolioLink = (index: number) => {
    setFormData({
      ...formData,
      portfolioLinks: (formData.portfolioLinks || []).filter((_, i) => i !== index),
    });
  };

  if (!grantId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Grant Selected</h2>
          <Link href="/grants" className="text-indigo-600 hover:underline">
            Browse Available Grants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Grant Application</h1>
          <p className="mt-2 text-gray-600">
            Fill out the form below to apply for this grant. Make sure your proposal is detailed and compelling.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your project title"
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Short Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Brief overview of your project (2-3 sentences)"
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Full Proposal */}
          <div className="mb-6">
            <label htmlFor="proposal" className="block text-sm font-medium text-gray-700 mb-2">
              Full Proposal *
            </label>
            <textarea
              id="proposal"
              value={formData.proposal}
              onChange={(e) => setFormData({ ...formData, proposal: e.target.value })}
              rows={8}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.proposal ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe your project in detail: goals, methodology, expected outcomes..."
            />
            {errors.proposal && <p className="mt-1 text-sm text-red-500">{errors.proposal}</p>}
          </div>

          {/* Budget */}
          <div className="mb-6">
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
              Requested Budget (XLM) *
            </label>
            <input
              type="number"
              id="budget"
              value={formData.budget || ''}
              onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.budget ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter budget amount"
              min="0"
              step="0.01"
            />
            {errors.budget && <p className="mt-1 text-sm text-red-500">{errors.budget}</p>}
          </div>

          {/* Timeline */}
          <div className="mb-6">
            <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
              Project Timeline *
            </label>
            <textarea
              id="timeline"
              value={formData.timeline}
              onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.timeline ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe your project timeline and milestones"
            />
            {errors.timeline && <p className="mt-1 text-sm text-red-500">{errors.timeline}</p>}
          </div>

          {/* Deliverables */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deliverables *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={deliverableInput}
                onChange={(e) => setDeliverableInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDeliverable())}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Add a deliverable"
              />
              <button
                type="button"
                onClick={addDeliverable}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Add
              </button>
            </div>
            {errors.deliverables && (
              <p className="mt-1 text-sm text-red-500">{errors.deliverables}</p>
            )}
            {formData.deliverables.length > 0 && (
              <ul className="mt-3 space-y-2">
                {formData.deliverables.map((item, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                    <span className="text-gray-700">{item}</span>
                    <button
                      type="button"
                      onClick={() => removeDeliverable(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Portfolio Links */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Portfolio Links (optional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={portfolioInput}
                onChange={(e) => setPortfolioInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPortfolioLink())}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://your-portfolio.com"
              />
              <button
                type="button"
                onClick={addPortfolioLink}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Add
              </button>
            </div>
            {(formData.portfolioLinks?.length ?? 0) > 0 && (
              <ul className="mt-3 space-y-2">
                {formData.portfolioLinks?.map((link, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                    <span className="text-gray-700 truncate">{link}</span>
                    <button
                      type="button"
                      onClick={() => removePortfolioLink(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
            <Link
              href={`/grants/${grantId}`}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
