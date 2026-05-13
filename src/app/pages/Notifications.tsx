import { Bell, CheckCircle } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { useNotifications } from '../context/NotificationContext';
import { motion } from 'motion/react';

export function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();

  return (
    <div className="min-h-screen overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <TopBar />

      <div className="w-full max-w-[480px] md:max-w-[768px] lg:max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 pb-20">
        <BackButton />
        
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8" style={{ color: '#0A84FF' }} />
            <div>
              <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {unreadCount} unread
                </p>
              )}
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: '#0A84FF', color: 'white' }}
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => markAsRead(notification.id)}
              className="rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
              style={{
                backgroundColor: notification.read ? 'var(--bg-card)' : 'rgba(10, 132, 255, 0.08)',
                border: notification.read ? '1px solid var(--border-color)' : '1px solid rgba(10, 132, 255, 0.3)',
                boxShadow: notification.read ? 'none' : '0 4px 12px rgba(10, 132, 255, 0.1)',
              }}
            >
              {!notification.read && (
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
              )}

              <div className="flex items-start gap-4 relative">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{
                    backgroundColor: notification.read ? 'rgba(255,255,255,0.05)' : 'rgba(10, 132, 255, 0.15)',
                  }}
                >
                  {notification.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-2 animate-pulse" style={{ backgroundColor: '#0A84FF' }} />
                    )}
                  </div>
                  <p className="text-sm mb-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--text-tertiary)' }} />
                    <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                      {notification.time}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              No notifications
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              You're all caught up!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}