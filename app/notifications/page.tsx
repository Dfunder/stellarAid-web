
'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { Button } from '@/components/ui/Button';

const NotificationsPage = () => {
  const { notifications, unreadCount, fetchNotifications, markAllAsRead, markAsRead } =
    useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <Button onClick={markAllAsRead} disabled={unreadCount === 0}>
          Mark all as read
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border ${
              notification.read ? 'bg-muted/50' : 'bg-background'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold">{notification.title}</h2>
                <p className="text-muted-foreground">{notification.message}</p>
                <span className="text-sm text-muted-foreground/50">
                  {new Date(notification.timestamp).toLocaleString()}
                </span>
              </div>
              {!notification.read && (
                <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                  Mark as read
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;