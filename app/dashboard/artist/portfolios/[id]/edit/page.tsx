'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  selectCurrentPortfolio,
  selectPortfoliosLoading,
} from '@/app/features/portfolios/portfoliosSelectors';
import { fetchPortfolioById, updatePortfolio } from '@/app/features/portfolios/portfoliosThunks';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import Button from '@/app/components/ui/Button';
import { Input, Textarea } from '@/app/components/ui/Input';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { ArrowLeft, Upload, X, Save } from 'lucide-react';
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
  'Street Art',
  'Digital Art',
  'Other',
];

export default function EditPortfolioPage() {
  const router = useRouter();
  const params = useParams();
  const portfolioId = params.id as string;
  const dispatch = useAppDispatch();
  const portfolio = useAppSelector(selectCurrentPortfolio);
  const loading = useAppSelector(selectPortfoliosLoading);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (portfolioId) {
      setIsLoadingPortfolio(true);
      dispatch(fetchPortfolioById(portfolioId)).finally(() => setIsLoadingPortfolio(false));
    }
  }, [portfolioId, dispatch]);

  useEffect(() => {
    if (portfolio) {
      setTitle(portfolio.title);
      setDescription(portfolio.description);
      setCategory(portfolio.category);
      setTags(portfolio.tags || []);
      setCoverImage(portfolio.coverImage || null);
    }
  }, [portfolio]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagsInput.trim().replace(/,/g, '');
      if (tag && !tags.includes(tag) && tags.length < 10) {
        setTags([...tags, tag]);
        setTagsInput('');
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (status?: 'draft' | 'published') => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const updateData: Partial<{
        title: string;
        description: string;
        category: string;
        tags: string[];
        coverImage?: string;
        status?: 'draft' | 'published';
      }> = {
        title: title.trim(),
        description: description.trim(),
        category,
        tags,
        coverImage: coverImage || undefined,
      };
      if (status) {
        updateData.status = status;
      }
      await dispatch(updatePortfolio({ id: portfolioId, data: updateData })).unwrap();
      router.push('/dashboard/artist/portfolios');
    } catch {
      // Error handled in thunk
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPortfolio) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl space-y-6">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!portfolio && !isLoadingPortfolio) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Portfolio Not Found
          </h2>
          <p className="text-neutral-400 dark:text-neutral-500 mb-6">
            The portfolio you&apos;re trying to edit doesn&apos;t exist or has been deleted.
          </p>
          <Link href="/dashboard/artist/portfolios">
            <Button variant="primary">Back to Portfolios</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        {/* Back Link */}
        <Link
          href="/dashboard/artist/portfolios"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portfolios
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Edit Portfolio</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Update your portfolio details and settings.
        </p>

        <div className="space-y-6">
          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Cover Image
            </label>
            {coverImage ? (
              <div className="relative rounded-xl overflow-hidden h-48 bg-neutral-100 dark:bg-neutral-800">
                <Image
                  src={coverImage}
                  alt="Cover"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 p-1.5 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-full text-neutral-600 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
                  isDragOver
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-400 dark:hover:border-primary-600'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="font-medium text-primary-600 dark:text-primary-400">
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </p>
                <p className="text-xs text-neutral-400 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
              </div>
            )}
          </div>

          {/* Title */}
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Brand Identity for Tech Startup"
            error={errors.title}
          />

          {/* Description */}
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your portfolio, the project goals, and your creative process..."
            rows={4}
            error={errors.description}
          />

          {/* Category */}
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

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Tags
            </label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type a tag and press Enter..."
              helperText="Press Enter or comma to add a tag. Max 10 tags."
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <Button
              variant="primary"
              onClick={() => handleSave()}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
            <Link href="/dashboard/artist/portfolios">
              <Button variant="ghost">Cancel</Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
