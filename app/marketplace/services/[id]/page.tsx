'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { selectCurrentService, selectServicesLoading } from '@/app/features/services/servicesSelectors';
import { fetchServiceById } from '@/app/features/services/servicesThunks';
import MainLayout from '@/app/components/layout/MainLayout';
import Button from '@/app/components/ui/Button';
import { Skeleton } from '@/app/components/ui/Skeleton';
import {
  Clock,
  RefreshCw,
  Check,
  Star,
  MessageSquare,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  User,
} from 'lucide-react';
import VerifiedBadge from '@/components/common/VerifiedBadge';

export default function ServiceDetailPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const dispatch = useAppDispatch();
  const service = useAppSelector(selectCurrentService);
  const loading = useAppSelector(selectServicesLoading);

  useEffect(() => {
    if (serviceId) {
      dispatch(fetchServiceById(serviceId));
    }
  }, [serviceId, dispatch]);

  if (loading || !service) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const artist = service.artist;
  const reviews = service.reviews || [];

  return (
    <MainLayout>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-medium rounded-full">
                    {service.category}
                  </span>
                  {service.status === 'published' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                  {service.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{service.deliveryDays} day{service.deliveryDays === 1 ? '' : 's'} delivery</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <RefreshCw className="w-4 h-4" />
                    <span>{service.revisions} revision{service.revisions === 1 ? '' : 's'}</span>
                  </div>
                  {service.rating !== undefined && (
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">{service.rating.toFixed(1)}</span>
                      <span className="text-neutral-400">({service.reviewCount || 0} reviews)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">About This Service</h2>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
                  {service.description}
                </p>
              </div>

              {/* Features */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">What&apos;s Included</h2>
                {service.features && service.features.length > 0 ? (
                  <ul className="space-y-3">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-neutral-700 dark:text-neutral-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-500 dark:text-neutral-400">No features listed.</p>
                )}
              </div>

              {/* Reviews */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Reviews ({reviews.length})
                  </h2>
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-neutral-500 dark:text-neutral-400">No reviews yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-neutral-100 dark:border-neutral-800 last:border-0 pb-6 last:pb-0"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                              {review.userAvatar ? (
                                <img
                                  src={review.userAvatar}
                                  alt={review.userName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-500">
                                  <User className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900 dark:text-white">{review.userName}</p>
                              <div className="flex items-center gap-1 text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < review.rating ? 'fill-current' : 'text-neutral-300 dark:text-neutral-600'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-neutral-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Order Card */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
                  <div className="flex items-end justify-between mb-4">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">Price</span>
                    <span className="text-3xl font-bold text-primary-700 dark:text-primary-400">
                      {service.price} <span className="text-lg font-medium">USDC</span>
                    </span>
                  </div>
                  <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Delivery
                      </span>
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {service.deliveryDays} day{service.deliveryDays === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Revisions
                      </span>
                      <span className="font-medium text-neutral-900 dark:text-white">{service.revisions}</span>
                    </div>
                  </div>
                  <Button variant="primary" size="lg" className="w-full">
                    Order This Service
                  </Button>
                  <p className="text-xs text-center text-neutral-400 mt-3">
                    Payment processed securely on Stellar
                  </p>
                </div>

                {/* Artist Card */}
                {artist && (
                  <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
                    <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-4">About the Artist</h3>
                    <Link
                      href={`/artists/${artist.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-14 h-14 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden flex-shrink-0">
                        {artist.avatar ? (
                          <img
                            src={artist.avatar}
                            alt={artist.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-500">
                            <User className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                            {artist.name}
                          </p>
                          {artist.verified && <VerifiedBadge size="sm" />}
                        </div>
                        {artist.rating !== undefined && (
                          <div className="flex items-center gap-1 text-amber-500 text-sm">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="font-medium">{artist.rating.toFixed(1)}</span>
                            <span className="text-neutral-400">({artist.reviewCount || 0} reviews)</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
