'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, Star, Clock, X, Bookmark, BookmarkCheck, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/app/components/ui/Pagination';
import { Skeleton } from '@/app/components/ui/Skeleton';

const CATEGORIES = ['Art', 'Music', 'Technology', 'Community', 'Film', 'Education'] as const;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'top-rated', label: 'Top Rated' },
] as const;

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  deliveryDays: number;
  rating?: number;
  reviewCount?: number;
  artist?: { name: string; avatar?: string };
  createdAt: string;
}

interface SavedSearch {
  id: string;
  name: string;
  searchQuery: string;
  selectedCategory: string;
  sortBy: string;
  maxPrice: string;
  createdAt: string;
}

const MOCK_SERVICES: ServiceItem[] = Array.from({ length: 36 }, (_, i) => {
  const cat = CATEGORIES[i % CATEGORIES.length] ?? 'Art';
  return {
    id: `svc-${String(i + 1).padStart(3, '0')}`,
    title: `${cat} service #${i + 1}`,
    description: `Professional ${cat.toLowerCase()} service with fast turnaround and high quality.`,
    category: cat,
    price: ((i % 8) + 1) * 25,
    deliveryDays: (i % 5) + 1,
    rating: 3.5 + (i % 15) / 10,
    reviewCount: ((i * 3) % 50) + 5,
    artist: { name: `Artist ${(i % 12) + 1}` },
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  };
});

function ServiceCardSkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <Skeleton className="h-4 w-3/4" rounded="rounded" />
      <Skeleton className="h-3 w-full" rounded="rounded" />
      <Skeleton className="h-3 w-2/3" rounded="rounded" />
      <Skeleton className="h-2 w-full" rounded="rounded-full" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-16" rounded="rounded" />
        <Skeleton className="h-4 w-20" rounded="rounded" />
      </div>
    </div>
  );
}

function ServiceCard({ service }: { service: ServiceItem }) {
  return (
    <Link
      href={`/marketplace/services/${service.id}`}
      className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
          {service.category}
        </span>
        {service.rating && (
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {service.rating.toFixed(1)}
            {service.reviewCount != null && (
              <span className="text-gray-400">({service.reviewCount})</span>
            )}
          </span>
        )}
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{service.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
        {service.description}
      </p>
      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="text-lg font-bold text-gray-900 dark:text-white">${service.price}</span>
        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="h-3 w-3" />
          {service.deliveryDays}d delivery
        </span>
      </div>
    </Link>
  );
}

export default function MarketplaceClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [isLoading] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredServices = useMemo(() => {
    let result = [...MOCK_SERVICES];

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.artist?.name.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((s) => s.category === selectedCategory);
    }

    if (maxPrice) {
      const price = parseFloat(maxPrice);
      if (!isNaN(price)) {
        result = result.filter((s) => s.price <= price);
      }
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'top-rated':
        result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [debouncedSearch, selectedCategory, sortBy, maxPrice]);

  const { paginatedItems, page, totalPages, totalItems, goToPage } = usePagination({
    items: filteredServices,
    pageSize: 9,
  });

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketplace</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Discover and collect unique creative works
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none placeholder:text-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              placeholder="Max $"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min={0}
              className="w-24 rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-2 text-sm outline-none placeholder:text-gray-400 focus:border-violet-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-violet-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {totalItems} service{totalItems !== 1 ? 's' : ''} found
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      ) : paginatedItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">No services match your filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setMaxPrice('');
            }}
            className="mt-3 inline-flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700"
          >
            <X className="h-3 w-3" /> Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedItems.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}

      <div className="mt-6">
        <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
      </div>
    </main>
  );
}