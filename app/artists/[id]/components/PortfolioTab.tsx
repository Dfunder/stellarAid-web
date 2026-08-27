'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/app/services/api';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Image, FolderOpen } from 'lucide-react';

interface PortfolioTabProps {
  artistId: string;
}

export default function PortfolioTab({ artistId }: PortfolioTabProps) {
  const { data: portfolios = [], isLoading: loading } = useQuery({
    queryKey: ['artistPortfolios', artistId],
    queryFn: async () => {
      const { data } = await api.get(`/artists/${artistId}/portfolios`);
      return data;
    },
    enabled: !!artistId,
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800"
          >
            <Skeleton className="h-48 w-full rounded-none" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-8 h-8 text-neutral-400" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
          No portfolios yet
        </h3>
        <p className="text-neutral-400 dark:text-neutral-500 text-sm max-w-sm mx-auto">
          This artist hasn&apos;t published any portfolios yet. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {portfolios.map((portfolio: any) => (
        <Link
          key={portfolio.id}
          href={`/portfolios/${portfolio.id}`}
          className="group bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg transition-all duration-300"
        >
          <div className="relative h-48 bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            {portfolio.coverImage ? (
              <img
                src={portfolio.coverImage}
                alt={portfolio.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Image className="w-12 h-12 text-neutral-300 dark:text-neutral-600" />
              </div>
            )}
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-xs font-medium text-neutral-600 dark:text-neutral-300 rounded-full">
                {portfolio.items?.length || 0} items
              </span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
              {portfolio.title}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
              {portfolio.description}
            </p>
            {portfolio.tags && portfolio.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {portfolio.tags.slice(0, 3).map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs rounded-md"
                  >
                    {tag}
                  </span>
                ))}
                {portfolio.tags.length > 3 && (
                  <span className="px-2 py-0.5 text-neutral-400 text-xs">
                    +{portfolio.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
