'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { selectServices, selectServicesLoading } from '@/app/features/services/servicesSelectors';
import { fetchServices, ServiceFilters } from '@/app/features/services/servicesThunks';
import MainLayout from '@/app/components/layout/MainLayout';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Search, SlidersHorizontal, Clock, DollarSign, Star, ArrowUpDown } from 'lucide-react';

const CATEGORIES = [
  'All',
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

const SORT_OPTIONS: { value: ServiceFilters['sort']; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'top-rated', label: 'Top Rated' },
];

export default function MarketplacePage() {
  const dispatch = useAppDispatch();
  const services = useAppSelector(selectServices);
  const loading = useAppSelector(selectServicesLoading);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [maxDeliveryDays, setMaxDeliveryDays] = useState('');
  const [sort, setSort] = useState<ServiceFilters['sort']>('newest');

  const loadServices = useCallback(() => {
    const filters: ServiceFilters = {
      sort,
      search: search.trim() || undefined,
      category: category === 'All' ? undefined : category,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      maxDeliveryDays: maxDeliveryDays ? Number(maxDeliveryDays) : undefined,
    };
    dispatch(fetchServices(filters));
  }, [dispatch, sort, search, category, minPrice, maxPrice, maxDeliveryDays]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadServices();
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        {/* Header */}
        <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Marketplace</h1>
                <p className="mt-2 text-neutral-500 dark:text-neutral-400">
                  Discover creative services from talented artists
                </p>
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                {loading
                  ? 'Loading services...'
                  : `${services.length} service${services.length === 1 ? '' : 's'} available`}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search services..."
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
              </form>

              {/* Category */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-neutral-400" />
                <input
                  type="number"
                  min={0}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-24 px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <span className="text-neutral-400">-</span>
                <input
                  type="number"
                  min={0}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-24 px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              {/* Delivery Days */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-400" />
                <input
                  type="number"
                  min={1}
                  value={maxDeliveryDays}
                  onChange={(e) => setMaxDeliveryDays(e.target.value)}
                  placeholder="Max days"
                  className="w-32 px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-neutral-400" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as ServiceFilters['sort'])}
                  className="px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && services.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4"
                >
                  <Skeleton className="h-40 w-full rounded-xl mb-4" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && services.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-neutral-400" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                No services found
              </h2>
              <p className="text-neutral-400 dark:text-neutral-500 max-w-md mx-auto">
                Try adjusting your filters or search terms to find what you&apos;re looking for.
              </p>
            </div>
          )}

          {/* Grid */}
          {services.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {services.map((service) => (
                <Link
                  key={service.id}
                  href={`/marketplace/services/${service.id}`}
                  className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all"
                >
                  {/* Card Header / Category Badge */}
                  <div className="relative h-40 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center">
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-xs font-medium text-neutral-700 dark:text-neutral-300 rounded-full">
                      {service.category}
                    </span>
                    <div className="text-center px-6">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white line-clamp-2 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                        {service.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    {/* Artist */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden flex-shrink-0">
                        {service.artist?.avatar ? (
                          <img
                            src={service.artist.avatar}
                            alt={service.artist.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
                            {service.artist?.name?.charAt(0).toUpperCase() || 'A'}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                        {service.artist?.name || 'Unknown Artist'}
                      </span>
                      {service.artist?.rating && (
                        <div className="flex items-center gap-1 ml-auto text-amber-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs font-medium">{service.artist.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{service.deliveryDays} day{service.deliveryDays === 1 ? '' : 's'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{service.revisions} revision{service.revisions === 1 ? '' : 's'}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                      <span className="text-xs text-neutral-400">Starting at</span>
                      <span className="text-lg font-bold text-primary-700 dark:text-primary-400">
                        {service.price} USDC
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
