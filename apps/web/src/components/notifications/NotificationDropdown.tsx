import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  Gavel,
  Truck,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  FileCheck,
  Info,
  X,
  BellOff,
  Sparkles,
} from 'lucide-react';

export type NotificationType =
  | 'BID'
  | 'SHIPMENT'
  | 'CUSTOMS'
  | 'PAYMENT'
  | 'SECURITY'
  | 'VERIFICATION'
  | 'SYSTEM';

export type NotificationPriority = 'URGENT' | 'HIGH' | 'NORMAL';

export interface InAppNotification {
  id: string;
  userId?: string;
  role?: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  createdAt: string;
  actionTab?: string;
  metadata?: Record<string, any>;
}

interface NotificationDropdownProps {
  role: string;
  userId?: string;
  onSelectTab?: (tabId: string) => void;
  isDark?: boolean;
  language?: 'EN' | 'AM' | 'OM';
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  role,
  userId,
  onSelectTab,
  isDark = false,
  language = 'EN',
}) => {
  const isAm = (language || '').toUpperCase() === 'AM';
  const isOm = (language || '').toUpperCase() === 'OM';
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'high'>('all');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch Notifications from Backend API
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications?role=${encodeURIComponent(role)}${userId ? `&userId=${encodeURIComponent(userId)}` : ''}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      // Quiet fail to not interrupt UX
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 3s for fresh live corridor updates
    const interval = setInterval(fetchNotifications, 3000);
    return () => clearInterval(interval);
  }, [role, userId]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Mark single notification as read
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      // ignore
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, userId }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      // ignore
    }
  };

  // Dismiss / Delete notification
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      const target = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      // ignore
    }
  };

  // Handle click on notification (mark read & switch tab if actionable)
  const handleNotificationClick = (item: InAppNotification) => {
    if (!item.read) {
      handleMarkAsRead(item.id);
    }
    if (item.actionTab && onSelectTab) {
      onSelectTab(item.actionTab);
      setIsOpen(false);
    }
  };

  // Filtered notifications
  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'unread') return !item.read;
    if (activeFilter === 'high') return item.priority === 'URGENT' || item.priority === 'HIGH';
    return true;
  });

  // Relative Time Formatter
  const formatRelativeTime = (isoString: string) => {
    try {
      const now = Date.now();
      const past = new Date(isoString).getTime();
      const diffSecs = Math.max(0, Math.floor((now - past) / 1000));

      if (diffSecs < 60) return isAm ? 'አሁን' : isOm ? 'Amma' : 'Just now';
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ${isAm ? 'በፊት' : isOm ? 'dura' : 'ago'}`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ${isAm ? 'በፊት' : isOm ? 'dura' : 'ago'}`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ${isAm ? 'በፊት' : isOm ? 'dura' : 'ago'}`;
    } catch (e) {
      return '';
    }
  };

  // Icon Resolver
  const renderIcon = (type: NotificationType) => {
    switch (type) {
      case 'BID':
        return <Gavel className="w-4 h-4 text-sky-500" />;
      case 'SHIPMENT':
        return <Truck className="w-4 h-4 text-emerald-500" />;
      case 'CUSTOMS':
        return <ShieldCheck className="w-4 h-4 text-indigo-500" />;
      case 'PAYMENT':
        return <CreditCard className="w-4 h-4 text-amber-500" />;
      case 'SECURITY':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'VERIFICATION':
        return <FileCheck className="w-4 h-4 text-purple-500" />;
      default:
        return <Info className="w-4 h-4 text-cyan-500" />;
    }
  };

  const getIconBackground = (type: NotificationType) => {
    switch (type) {
      case 'BID':
        return 'bg-sky-500/10 border-sky-500/20';
      case 'SHIPMENT':
        return 'bg-emerald-500/10 border-emerald-500/20';
      case 'CUSTOMS':
        return 'bg-indigo-500/10 border-indigo-500/20';
      case 'PAYMENT':
        return 'bg-amber-500/10 border-amber-500/20';
      case 'SECURITY':
        return 'bg-rose-500/10 border-rose-500/20';
      case 'VERIFICATION':
        return 'bg-purple-500/10 border-purple-500/20';
      default:
        return 'bg-cyan-500/10 border-cyan-500/20';
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
          isOpen
            ? 'bg-[#0284C7]/15 border-[#0284C7] text-[#0284C7]'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-2xs'
        }`}
        title={isAm ? 'የኮሪዶር ማሳወቂያዎች' : isOm ? 'Beeksisa Koriidarii' : 'Corridor Live Notifications'}
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-black rounded-full bg-rose-600 text-white flex items-center justify-center shadow-sm animate-pulse border-2 border-white dark:border-[#0F172A]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Modern Popover Panel */}
      {isOpen && (
        <div className="absolute right-0 top-11 w-84 sm:w-96 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70 backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0284C7]/10 flex items-center justify-center text-[#0284C7]">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                  {isAm ? 'ማሳወቂያዎች' : isOm ? 'Beeksisa' : 'Notifications'}
                </h3>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {unreadCount > 0
                    ? `${unreadCount} ${isAm ? 'አዲስ ያልተነበቡ' : isOm ? 'kan hin dubbifamne' : 'unread live alerts'}`
                    : isAm ? 'ሁሉም ተነበዋል' : isOm ? 'Hundi dubbifameera' : 'All caught up'}
                </span>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-[#0284C7] hover:text-[#0369a1] dark:text-sky-400 dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer transition px-2 py-1 rounded-lg hover:bg-[#0284C7]/10"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{isAm ? 'ሁሉንም አንብብ' : isOm ? 'Hunda dubbisi' : 'Mark all read'}</span>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 bg-slate-50/40 dark:bg-slate-900/30">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {isAm ? 'ሁሉም' : isOm ? 'Hunda' : 'All'} ({notifications.length})
            </button>

            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                activeFilter === 'unread'
                  ? 'bg-[#0284C7] text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{isAm ? 'ያልተነበቡ' : isOm ? 'Kan Hin Dubbifamne' : 'Unread'}</span>
              {unreadCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveFilter('high')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                activeFilter === 'high'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {isAm ? 'አስቸኳይ' : isOm ? 'Ariifachiisaa' : 'High Priority'}
            </button>
          </div>

          {/* Notifications Scrollable List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <BellOff className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {activeFilter === 'unread'
                    ? (isAm ? 'ምንም ያልተነበበ ማሳወቂያ የለም' : isOm ? 'Beeksisni hin dubbifamne hin jiru' : 'No unread notifications')
                    : (isAm ? 'ምንም ማሳወቂያ የለም' : isOm ? 'Beeksisni hin argamne' : 'No notifications found')}
                </p>
                <p className="text-[10px] text-slate-400 max-w-[200px]">
                  {isAm
                    ? 'አዳዲስ የጨረታ፣ የጉምሩክ እና የጭነት ዝመናዎች እዚህ ይታያሉ።'
                    : isOm
                    ? 'Odeeffannoon haaraan caalbaasii, gumruukaa fi fe\'iisaa asitti mul\'ata.'
                    : 'Live updates on freight dispatches, bids, and customs will arrive here.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 transition flex items-start gap-3 cursor-pointer group relative ${
                    item.read
                      ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40 bg-transparent'
                      : 'bg-sky-50/40 dark:bg-sky-950/20 hover:bg-sky-50/80 dark:hover:bg-sky-950/30'
                  }`}
                >
                  {/* Category Icon */}
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${getIconBackground(item.type)}`}>
                    {renderIcon(item.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-xs font-black truncate leading-tight ${
                        item.read ? 'text-slate-800 dark:text-slate-200' : 'text-slate-900 dark:text-white'
                      }`}>
                        {item.title}
                      </span>
                      {item.priority === 'URGENT' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-500/20 text-rose-500 border border-rose-500/30 shrink-0">
                          URGENT
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug line-clamp-2">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                      {item.actionTab && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700 text-[10px]">•</span>
                          <span className="text-[10px] font-bold text-[#0284C7] dark:text-sky-400 group-hover:underline flex items-center gap-0.5">
                            <span>{isAm ? 'ክፈት' : isOm ? 'Bani' : 'View in'} {item.actionTab}</span>
                            <span>➔</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Unread indicator or Dismiss action */}
                  <div className="shrink-0 flex items-center gap-1">
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-[#0284C7] shadow-sm" />
                    )}
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                      title={isAm ? 'አስወግድ' : isOm ? 'Haqi' : 'Dismiss'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Status */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Corridor Stream</span>
            </div>
            <button
              onClick={() => {
                fetchNotifications();
              }}
              className="text-[10px] font-bold text-slate-500 hover:text-[#0284C7] dark:text-slate-400 dark:hover:text-sky-400 cursor-pointer transition flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#0284C7]" />
              <span>{isAm ? 'አድስ' : isOm ? 'Haaresi' : 'Refresh'}</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
