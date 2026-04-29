'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Heart, 
  MessageSquare, 
  Settings, 
  Info,
  Check,
  CheckCircle,
  X,
  ExternalLink
} from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import type { AppNotification } from '@/types';
import { cn } from '@/lib/utils';

const NOTIFICATION_ICONS = {
  donation: Heart,
  campaign_update: MessageSquare,
  admin_message: Settings,
  system: Info,
} as const;

const NOTIFICATION_COLORS = {
  donation: 'text-pink-600 bg-pink-50',
  campaign_update: 'text-blue-600 bg-blue-50',
  admin_message: 'text-purple-600 bg-purple-50',
  system: 'text-gray-600 bg-gray-50',
} as const;

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}

interface NotificationsDropdownProps {
  className?: string;
}

export function NotificationsDropdown({ className }: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Notification Bell */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const IconComponent = NOTIFICATION_ICONS[notification.type];
                    const colorClass = NOTIFICATION_COLORS[notification.type];
                    
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-4 hover:bg-gray-50 transition-colors cursor-pointer relative',
                          !notification.read && 'bg-blue-50/40'
                        )}
                      >
                        {/* Unread indicator */}
                        {!notification.read && (
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                        
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={cn('p-2 rounded-lg flex-shrink-0', colorClass)}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-gray-900 truncate">
                                  {notification.title}
                                </h4>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatTimeAgo(notification.createdAt)}
                                </p>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {!notification.read && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(notification.id);
                                    }}
                                    className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                                    title="Mark as read"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                )}
                                
                                {notification.link && (
                                  <Link
                                    href={notification.link}
                                    onClick={() => handleNotificationClick(notification)}
                                    className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                                    title="View details"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-100 text-center">
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                >
                  View all notifications
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
