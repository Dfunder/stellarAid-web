'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import ErrorMessage from '@/app/components/common/ErrorMessage';
import Spinner from '@/app/components/common/Spinner';

type FilterValue = 'all' | 'unread';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  unread: boolean;
  destination: string;
}

const PAGE_SIZE = 6;

const FALLBACK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'New message from Adaeze Okafor',
    body: 'The revised agreement is ready for your review.',
    timestamp: 'Just now',
    unread: true,
    destination: '/dashboard/messages/1',
  },
  {
    id: 'n2',
    title: 'Payment released',
    body: 'Lola Design Co. released $240 for “Logo pack v3”.',
    timestamp: '2 hours ago',
    unread: true,
    destination: '/dashboard/payments',
  },
  {
    id: 'n3',
    title: 'Commission accepted',
    body: 'Tunde Bakare accepted your commission request.',
    timestamp: 'Yesterday',
    unread: true,
    destination: '/dashboard/artist/commissions',
  },
  {
    id: 'n4',
    title: 'New review on your portfolio',
    body: 'Chinedu Arts Studio left a 5★ review.',
    timestamp: '2 days ago',
    unread: false,
    destination: '/dashboard/artist/portfolios',
  },
  {
    id: 'n5',
    title: 'Milestone approved',
    body: 'Ifeoma Adeleke approved milestone “Sketches”.',
    timestamp: '3 days ago',
    unread: false,
    destination: '/dashboard/artist/commissions',
  },
  {
    id: 'n6',
    title: 'Portfolio draft published',
    body: 'Your latest portfolio draft is now visible to clients.',
    timestamp: '4 days ago',
    unread: false,
    destination: '/dashboard/artist/portfolios',
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/notifications');
        if (!response.ok) {
          throw new Error('Unable to load notifications');
        }

        const payload = await response.json();
        const nextNotifications = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.notifications)
            ? payload.notifications
            : FALLBACK_NOTIFICATIONS;

        if (active) {
          setNotifications(nextNotifications as NotificationItem[]);
        }
      } catch (error) {
        if (active) {
          setNotifications(FALLBACK_NOTIFICATIONS);
          setError(
            'We could not load the latest notifications right now. Showing the locally cached list instead.'
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((item) => item.unread);
    }

    return notifications;
  }, [filter, notifications]);

  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedNotifications = filteredNotifications.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const unreadCount = notifications.filter((item) => item.unread).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, unread: false } : item))
    );
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (item.unread) {
      markNotificationAsRead(item.id);
    }

    if (item.destination) {
      router.push(item.destination);
    }
  };

  const markAllRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
  };

  return (
    <DashboardLayout>
      <main id="main-content" tabIndex={-1} className="space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
              <Bell className="h-4 w-4" />
              <span>Activity center</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Review recent updates and jump straight back into your work.
            </p>
          </div>

          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Filter</span>
            <div className="flex rounded-full border border-gray-200 p-1 dark:border-gray-700">
              {(['all', 'unread'] as FilterValue[]).map((option) => {
                const isActive = filter === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFilter(option)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    {option === 'all' ? 'All' : 'Unread'}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>

        {error ? (
          <ErrorMessage message={error} className="border-blue-200 bg-blue-50 text-blue-800" />
        ) : null}

        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-8 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
              <Spinner size="lg" className="text-blue-600" />
              <p className="text-sm">Loading notifications…</p>
            </div>
          </div>
        ) : paginatedNotifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20">
              <Inbox className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              No notifications found
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {filter === 'unread'
                ? 'You have no unread notifications right now.'
                : 'Your notification feed is clear for the moment.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <ul className="space-y-3">
              {paginatedNotifications.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleNotificationClick(item)}
                    className={`flex w-full items-start justify-between gap-4 rounded-2xl border px-4 py-4 text-left transition ${
                      item.unread
                        ? 'border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 dark:border-blue-900/40 dark:bg-blue-900/20 dark:hover:bg-blue-900/30'
                        : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      {item.unread ? (
                        <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
                      ) : null}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                            {item.title}
                          </p>
                          {item.unread ? (
                            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                              New
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{item.body}</p>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {item.timestamp}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Open
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
              <p>
                Showing {paginatedNotifications.length} of {filteredNotifications.length}{' '}
                notifications
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={safePage === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>
                <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium dark:bg-gray-800">
                  {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={safePage === totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
