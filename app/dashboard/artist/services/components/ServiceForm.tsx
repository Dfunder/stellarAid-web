'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/app/store/hooks';
import { createService, updateService, ServiceFormData } from '@/app/features/services/servicesThunks';
import { Service } from '@/app/features/services/servicesSlice';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import Button from '@/app/components/ui/Button';
import { Input, Textarea } from '@/app/components/ui/Input';
import { ArrowLeft, Plus, X, Clock, RefreshCw, DollarSign, Briefcase } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  'Illustration',
  'Graphic Design',
  'Photography',
  '3D Art',
  'Animation',
  'UI/UX Design',
  'Motion Graphics',
  'Fine Art',
  'Digital Art',
  'Other',
];

interface ServiceFormProps {
  mode: 'create' | 'edit';
  initialService?: Service | null;
}

export default function ServiceForm({ mode, initialService }: ServiceFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState(initialService?.title || '');
  const [category, setCategory] = useState(initialService?.category || '');
  const [description, setDescription] = useState(initialService?.description || '');
  const [features, setFeatures] = useState<string[]>(initialService?.features || []);
  const [featureInput, setFeatureInput] = useState('');
  const [price, setPrice] = useState(initialService?.price ? String(initialService.price) : '');
  const [deliveryDays, setDeliveryDays] = useState(
    initialService?.deliveryDays ? String(initialService.deliveryDays) : ''
  );
  const [revisions, setRevisions] = useState(
    initialService?.revisions ? String(initialService.revisions) : ''
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddFeature = () => {
    const feature = featureInput.trim();
    if (feature && !features.includes(feature) && features.length < 10) {
      setFeatures([...features, feature]);
      setFeatureInput('');
    }
  };

  const handleFeatureKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFeature();
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setFeatures(features.filter((f: string) => f !== feature));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!category) newErrors.category = 'Category is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!price || Number(price) <= 0) newErrors.price = 'Price must be greater than 0';
    if (!deliveryDays || Number(deliveryDays) < 1) newErrors.deliveryDays = 'Delivery days must be at least 1';
    if (revisions === '' || Number(revisions) < 0) newErrors.revisions = 'Revisions cannot be negative';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildFormData = (status: ServiceFormData['status']): ServiceFormData => ({
    title: title.trim(),
    description: description.trim(),
    category,
    features,
    price: Number(price),
    deliveryDays: Number(deliveryDays),
    revisions: Number(revisions),
    status,
  });

  const handleSave = async (status: ServiceFormData['status']) => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const data = buildFormData(status);
      if (mode === 'edit' && initialService) {
        await dispatch(updateService({ id: initialService.id, data })).unwrap();
      } else {
        await dispatch(createService(data)).unwrap();
      }
      router.push('/dashboard/artist/services');
    } catch {
      // Error handled in thunk
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewService: Partial<Service> = {
    title: title.trim() || 'Service Title',
    description: description.trim() || 'Brief description of your service will appear here.',
    category: category || 'Category',
    features: features.length > 0 ? features : ['Feature example'],
    price: Number(price) || 0,
    deliveryDays: Number(deliveryDays) || 1,
    revisions: Number(revisions) || 0,
    artist: { id: '', name: 'Your Name' },
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        {/* Back Link */}
        <Link
          href="/dashboard/artist/services"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {mode === 'edit' ? 'Edit Service' : 'Create New Service'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {mode === 'edit'
            ? 'Update your service details and pricing.'
            : 'Set up a new service for clients to discover and order.'}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Form */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-6">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Custom Digital Illustration"
              error={errors.title}
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                  errors.category ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'
                }`}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>

            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what clients will receive, your process, and any requirements..."
              rows={5}
              error={errors.description}
            />

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Features
              </label>
              <div className="flex gap-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={handleFeatureKeyDown}
                  placeholder="Add a feature and press Enter"
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={handleAddFeature}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {features.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-sm text-neutral-700 dark:text-neutral-300"
                    >
                      <span>{feature}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(feature)}
                        className="text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Price (USDC)"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="50"
                leftIcon={<DollarSign className="w-4 h-4" />}
                error={errors.price}
              />
              <Input
                label="Delivery Days"
                type="number"
                min={1}
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                placeholder="7"
                leftIcon={<Clock className="w-4 h-4" />}
                error={errors.deliveryDays}
              />
              <Input
                label="Revisions"
                type="number"
                min={0}
                value={revisions}
                onChange={(e) => setRevisions(e.target.value)}
                placeholder="2"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                error={errors.revisions}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <Button
                variant="primary"
                onClick={() => handleSave('published')}
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {mode === 'edit' ? 'Save & Publish' : 'Publish Service'}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSave('draft')}
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Save as Draft
              </Button>
              <Link href="/dashboard/artist/services">
                <Button variant="ghost">Cancel</Button>
              </Link>
            </div>
          </div>

          {/* Preview Card */}
          <div className="lg:sticky lg:top-24">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">Preview</h3>
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center">
                <Briefcase className="w-12 h-12 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="p-5">
                <span className="inline-block px-2.5 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-medium rounded-full mb-3">
                  {previewService.category}
                </span>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  {previewService.title}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-3 mb-4">
                  {previewService.description}
                </p>

                <div className="space-y-2 mb-4">
                  {previewService.features?.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400" />
                      </div>
                      <span className="line-clamp-1">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {previewService.deliveryDays} day{previewService.deliveryDays === 1 ? '' : 's'}
                  </span>
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-4 h-4" />
                    {previewService.revisions} revision{previewService.revisions === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">Price</span>
                  <span className="text-xl font-bold text-primary-700 dark:text-primary-400">
                    {previewService.price} USDC
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
