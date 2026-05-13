import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Notification {
  id: number;
  type: 'win' | 'reward' | 'referral' | 'prediction' | 'system' | 'bonus';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'time'>) => void;
  markAsRead: (id: number) => void;
  markAllRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, type: 'win', title: 'Game Win!', message: 'You won $18 in the color prediction game', time: '5 mins ago', read: false, icon: '🎮' },
    { id: 2, type: 'reward', title: 'Daily Reward', message: '$3 daily reward claimed successfully', time: '2 hours ago', read: false, icon: '🎁' },
    { id: 3, type: 'referral', title: 'New Referral', message: 'You earned $5 from a referral!', time: '1 day ago', read: false, icon: '👥' },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'time'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      read: false,
      time: 'Just now',
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Listen for notification events from other contexts
  useEffect(() => {
    const handleAddNotification = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { type, title, message, icon } = customEvent.detail;
      addNotification({ type, title, message, icon });
    };

    window.addEventListener('addNotification', handleAddNotification);

    return () => {
      window.removeEventListener('addNotification', handleAddNotification);
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
