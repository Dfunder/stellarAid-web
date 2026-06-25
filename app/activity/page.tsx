'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Rocket, Heart, Flag } from 'lucide-react';

type ActivityType = 'launch' | 'donation' | 'milestone';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
}

interface Stats {
  volume24h: string;
  donationCount24h: number;
  campaignsLaunched24h: number;
}

const ICONS: Record<ActivityType, React.ReactNode> = {
  launch: <Rocket className="h-4 w-4 text-blue-600" aria-hidden="true" />,
  donation: <Heart className="h-4 w-4 text-pink-600" aria-hidden="true" />,
  milestone: <Flag className="h-4 w-4 text-green-600" aria-hidden="true" />,
};

const TYPE_STYLES: Record<ActivityType, string> = {
  launch: 'bg-blue-50 border-blue-200',
  donation: 'bg-pink-50 border-pink-200',
  milestone: 'bg-green-50 border-green-200',
};

const PAGE_SIZE = 20;

export default function ActivityFeedPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/activity?page=${pageNum}&limit=${PAGE_SIZE}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setItems((prev) => (pageNum === 1 ? data.items : [...prev, ...data.items]));
      setHasMore(data.hasMore ?? data.items.length === PAGE_SIZE);
      if (pageNum === 1 && data.stats) setStats(data.stats);
    } catch {
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPage(1); }, [fetchPage]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading && hasMore) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  useEffect(() => {
    if (page > 1) fetchPage(page);
  }, [page, fetchPage]);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">Global Activity Feed</h1>
      <p className="text-sm text-neutral-500 mb-6">Live platform activity — new campaigns, donations, and milestone releases.</p>

      {/* 24h Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm">
            <p className="text-xl font-bold text-neutral-900">{stats.volume24h}</p>
            <p className="text-xs text-neutral-500 mt-1">24h Volume</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm">
            <p className="text-xl font-bold text-neutral-900">{stats.donationCount24h}</p>
            <p className="text-xs text-neutral-500 mt-1">Donations (24h)</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm">
            <p className="text-xl font-bold text-neutral-900">{stats.campaignsLaunched24h}</p>
            <p className="text-xs text-neutral-500 mt-1">Launched (24h)</p>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-start gap-3 rounded-xl border p-4 ${TYPE_STYLES[item.type]}`}
          >
            <div className="mt-0.5 shrink-0">{ICONS[item.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">{item.title}</p>
              <p className="text-sm text-neutral-600">{item.description}</p>
            </div>
            <time className="text-xs text-neutral-400 whitespace-nowrap shrink-0">
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </time>
          </div>
        ))}

        {/* Infinite scroll sentinel */}
        <div ref={loaderRef} className="h-8 flex items-center justify-center">
          {isLoading && (
            <div className="h-5 w-5 rounded-full border-2 border-neutral-300 border-t-neutral-600 animate-spin" aria-label="Loading more" />
          )}
          {!hasMore && items.length > 0 && (
            <p className="text-xs text-neutral-400">You&apos;ve reached the end.</p>
          )}
          {!isLoading && items.length === 0 && (
            <p className="text-sm text-neutral-500">No activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
