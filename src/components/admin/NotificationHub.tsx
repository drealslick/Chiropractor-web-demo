import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  ArrowRight,
  Inbox,
  Calendar,
  Sparkles,
  CheckCheck,
} from 'lucide-react';
import {
  DispatchedNotification,
  getDispatchedNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  dismissNotification,
} from '../../data/leadsStore';

interface NotificationHubProps {
  onNavigateTab: (tab: 'leads' | 'booking' | 'site' | 'setup') => void;
}

export const NotificationHub: React.FC<NotificationHubProps> = ({ onNavigateTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<DispatchedNotification[]>(
    getDispatchedNotifications
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<DispatchedNotification[]>;
      setNotifications(custom.detail || getDispatchedNotifications());
    };
    window.addEventListener('notifications_updated', handleUpdate);
    return () => window.removeEventListener('notifications_updated', handleUpdate);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    const updated = markAllNotificationsAsRead();
    setNotifications(updated);
  };

  const handleItemClick = (notif: DispatchedNotification) => {
    markNotificationAsRead(notif.id);
    setIsOpen(false);

    // Contextual routing based on notification content
    const lower = (notif.subject + ' ' + notif.message).toLowerCase();
    if (lower.includes('john doe') || lower.includes('online request') || lower.includes('inquiry')) {
      onNavigateTab('leads');
    } else if (lower.includes('cancel') || lower.includes('running late') || lower.includes('appointment')) {
      onNavigateTab('booking');
    } else {
      onNavigateTab('leads');
    }
  };

  const handleDismiss = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = dismissNotification(id);
    setNotifications(updated);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Top Header Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
          isOpen
            ? 'bg-stone-800 text-emerald-400'
            : 'text-stone-300 hover:text-white hover:bg-stone-850'
        }`}
        aria-label="Reception Notifications"
        title="Reception Live Alerts & Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-stone-900 border border-stone-750 rounded-2xl shadow-2xl z-[150] overflow-hidden animate-fade-in text-stone-200">
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-stone-800 bg-stone-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-200">
                Reception Notification Hub
              </h4>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span className="hidden sm:inline">Mark read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-stone-400 hover:text-white rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-stone-800/60 p-1">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400 space-y-1">
                <Bell className="w-6 h-6 text-stone-600 mx-auto mb-1" />
                <p className="font-medium text-stone-300">All caught up!</p>
                <p className="text-[11px] text-stone-500">No new incoming alerts or cancellation notices.</p>
              </div>
            ) : (
              notifications.map((item) => {
                const isUnread = !item.read;
                const lower = (item.subject + ' ' + item.message).toLowerCase();

                // Specific dot indicators as requested by user:
                // 🔴 "New online request from John Doe."
                // 🟡 "Sarah Jenkins cancelled her 3:00 PM appointment."
                // 🟢 "Dr. Vance's 2:00 PM is running 15 minutes late."
                let dotClass = 'bg-emerald-400';
                let iconColor = 'text-emerald-400';

                if (lower.includes('john doe') || lower.includes('request') || lower.includes('inquiry')) {
                  dotClass = 'bg-rose-500';
                  iconColor = 'text-rose-400';
                } else if (lower.includes('sarah jenkins') || lower.includes('cancelled') || lower.includes('cancel')) {
                  dotClass = 'bg-amber-400';
                  iconColor = 'text-amber-400';
                } else if (lower.includes('running') || lower.includes('late') || lower.includes('delay')) {
                  dotClass = 'bg-emerald-400';
                  iconColor = 'text-emerald-400';
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`p-3 rounded-xl transition cursor-pointer flex items-start gap-2.5 group ${
                      isUnread
                        ? 'bg-stone-850/80 hover:bg-stone-800 text-stone-100'
                        : 'hover:bg-stone-850/40 text-stone-400 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {/* Urgency Color Dot */}
                    <div className="pt-1 shrink-0">
                      <span className={`w-2.5 h-2.5 rounded-full block ${dotClass}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-xs font-bold truncate ${isUnread ? 'text-white' : 'text-stone-300'}`}>
                          {item.subject}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDismiss(e, item.id)}
                          className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-stone-300 p-0.5 rounded cursor-pointer"
                          title="Dismiss"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      <p className="text-[11px] text-stone-300 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between mt-1.5 text-[10px] text-stone-400">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="text-emerald-400 font-bold group-hover:underline flex items-center gap-0.5">
                          <span>View</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Navigation Shortcuts */}
          <div className="p-2.5 bg-stone-950 border-t border-stone-800 text-center">
            <button
              type="button"
              onClick={() => {
                onNavigateTab('booking');
                setIsOpen(false);
              }}
              className="text-[11px] font-bold text-stone-400 hover:text-emerald-300 transition"
            >
              Open Booking & EHR Live Center →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
