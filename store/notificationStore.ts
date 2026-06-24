
import { create } from 'zustand';

// Define the shape of a single notification
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'donation' | 'milestone' | 'campaign' | 'release';
  read: boolean;
  timestamp: string;
  link: string;
}

// Define the state and actions for the notification store
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
}

// Mock data for notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Donation',
    message: 'You received a $50 donation for "Project Hope".',
    type: 'donation',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    link: '/dashboard/campaigns/1/donations',
  },
  {
    id: '2',
    title: 'Milestone Unlocked',
    message: 'Congratulations! You've unlocked the "First 100 Backers" milestone.',
    type: 'milestone',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    link: '/dashboard/campaigns/1/milestones',
  },
  {
    id: '3',
    title: 'Campaign Update',
    message: 'Your campaign "Project Hope" has been approved and is now live.',
    type: 'campaign',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    link: '/dashboard/campaigns/1',
  },
  {
    id: '4',
    title: 'Release Completed',
    message: 'Funds for the first milestone have been released to your wallet.',
    type: 'release',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    link: '/dashboard/payouts',
  },
  // Add more mock notifications to reach a total of 20
  ...Array.from({ length: 16 }, (_, i) => ({
    id: `${i + 5}`,
    title: `Notification ${i + 5}`,
    message: `This is mock notification number ${i + 5}.`,
    type: 'campaign' as 'campaign',
    read: i % 2 === 0, // Alternate read status
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * (i + 3)).toISOString(),
    link: '#',
  })),
];

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  fetchNotifications: () => {
    // Simulate API call
    setTimeout(() => {
      const sortedNotifications = [...mockNotifications].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const unread = sortedNotifications.filter((n) => !n.read).length;
      set({ notifications: sortedNotifications.slice(0, 20), unreadCount: unread });
    }, 500);
  },
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },
  markAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      unreadCount: state.notifications.filter((n) => !n.read && n.id !== id).length,
    }));
  },
}));