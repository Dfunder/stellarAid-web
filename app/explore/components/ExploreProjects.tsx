'use client';

import { useEffect, useState, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

export interface ExploreProject {
  id: string;
  title: string;
  creator: string;
  category: string;
  description: string;
  raisedXlm: number;
  goalXlm: number;
  backers: number;
}

const PAGE_SIZE = 12;

const CATEGORIES = ['Art', 'Music', 'Technology', 'Community', 'Film', 'Education'] as const;

async function fetchProjectsPage({
  pageParam,
  category,
}: {
  pageParam: number;
  category?: string;
}): Promise<{ items: ExploreProject[]; nextPage: number | null }> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const totalItems = 54;
  const start = (pageParam - 1) * PAGE_SIZE;
  if (start >= totalItems) return { items: [], nextPage: null };

  const items: ExploreProject[] = Array.from(
    { length: Math.min(PAGE_SIZE, totalItems - start) },
    (_, i): ExploreProject | null => {
      const n = start + i + 1;
      const projectCategory = CATEGORIES[n % CATEGORIES.length] ?? 'Community';
      if (category && category !== 'all' && projectCategory !== category) {
        return null;
      }
      const goalXlm = ((n % 8) + 3) * 500;
      return {
        id: `proj-${String(n).padStart(3, '0')}`,
        title: `${projectCategory} project #${n}`,
        creator: `creator${(n % 12) + 1}`,
        category: projectCategory,
        description:
          'A community-funded initiative powered by the Stellar network with transparent on-chain milestones.',
        raisedXlm: Math.round(goalXlm * (((n % 9) + 1) / 10)),
        goalXlm,
        backers: (n * 7) % 240,
      };
    }
  ).filter((item): item is ExploreProject => item !== null);

  const nextPage = start + PAGE_SIZE < totalItems ? pageParam + 1 : null;
  return { items, nextPage };
}

function ProjectCardSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex gap-3">
        <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        </div>
      </div>
      <div className="h-3 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
      <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
      <div className="h-2 w-full animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
    </div>
  );
}

function ProjectCard({ project }: { project: ExploreProject }) {
  const pct = Math.min(100, Math.round((project.raisedXlm / project.goalXlm) * 100));
  return (
    <article className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
          {project.category}
        </span>
        <span className="text-xs text-gray-400">@{project.creator}</span>
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{project.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
        {project.description}
      </p>

      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div className="h-full rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-gray-900 dark:text-white">
            {project.raisedXlm.toLocaleString()} XLM
          </span>
          <span className="text-xs text-gray-500">{pct}% funded</span>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          {project.backers} backers · goal {project.goalXlm.toLocaleString()} XLM
        </p>
      </div>
    </article>
  );
}

export default function ExploreProjects() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialCategory = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const { data, status, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['explore-projects', selectedCategory],
    queryFn: ({ pageParam }) =>
      fetchProjectsPage({
        pageParam,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const { ref: sentinelRef, inView } = useInView({ rootMargin: '400px 0px' });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleCategoryChange = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      const params = new URLSearchParams(searchParams.toString());
      if (category === 'all') {
        params.delete('category');
      } else {
        params.set('category', category);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  if (status === 'pending') {
    return (
      <div
        aria-busy="true"
        aria-label="Loading projects"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        {(error as Error)?.message || 'Failed to load projects.'}
      </div>
    );
  }

  return (
    <>
      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryChange('all')}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
            selectedCategory === 'all'
              ? 'bg-violet-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          )}
        >
          All
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              selectedCategory === category
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.pages.map((page) =>
          page.items.map((project) => <ProjectCard key={project.id} project={project} />)
        )}
      </div>

      {hasNextPage && <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />}

      {isFetchingNextPage && (
        <div aria-live="polite" aria-busy="true" className="mt-6 space-y-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Loading more projects…
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {!hasNextPage && (
        <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
          You&rsquo;ve reached the end — that&rsquo;s every live project for now.
        </p>
      )}
    </>
  );
}
