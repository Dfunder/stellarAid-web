'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, Check } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  unread: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'New message from Adaeze Okafor',
    body: '“I just sent the revised agreement for review.”',
    timestamp: 'Just now',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Payment released',
    body: 'Lola Design Co. released $240 for “Logo pack v3”.',
    timestamp: '2 hours ago',
    unread: true,
  },
  {
    id: 'n3',
    title: 'Commission accepted',
    body: 'Tunde Bakare accepted your commission request.',
    timestamp: 'Yesterday',
    unread: true,
  },
  {
    id: 'n4',
    title: 'New review on your portfolio',
    body: 'Chinedu Arts Studio left a 5★ review.',
    timestamp: '2 days ago',
    unread: false,
  },
  {
    id: 'n5',
    title: 'Milestone approved',
    body: 'Ifeoma Adeleke approved milestone “Sketches”.',
    timestamp: '3 days ago',
    unread: false,
  },
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const markAllRead = () => {
    setNotifications((current) => current.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : 'Notifications, no unread'
        }
        aria-expanded={open}
        aria-haspopup="true"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-none text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
        >
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">Notifications</p>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Mark all read
            </button>
          </div>

          <ul className="max-h-80 overflow-y-auto" aria-label="Notification list">
            {notifications.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                You&apos;re all caught up.
              </li>
            ) : (
              notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={
                    'border-b border-neutral-100 px-4 py-3 last:border-b-0 dark:border-neutral-700 ' +
                    (notification.unread ? 'bg-primary-50/60 dark:bg-primary-900/20' : '')
                  }
                >
                  <div className="flex items-start gap-3">
                    {notification.unread && (
                      <span
                        aria-hidden="true"
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-neutral-600 dark:text-neutral-300">
                        {notification.body}
                      </p>
                      <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                        {notification.timestamp}
                      </p>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>

          <div className="border-t border-neutral-200 px-4 py-2 dark:border-neutral-700">
            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-2 py-1.5 text-center text-xs font-medium text-primary-600 hover:bg-neutral-100 dark:text-primary-400 dark:hover:bg-neutral-700"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
