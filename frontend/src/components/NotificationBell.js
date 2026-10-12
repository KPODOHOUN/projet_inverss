import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const timeAgo = (date) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'à l\'instant';
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
};

export default function NotificationBell({ onNavigate }) {
  const { api } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const boxRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data.notifications);
        setUnreadCount(res.data.data.unreadCount);
      }
    } catch (e) { /* keep last known */ }
  }, [api]);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClick = async (notif) => {
    if (!notif.read) {
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      api.post(`/notifications/${notif._id}/read`).catch(() => {});
    }
    if (notif.type === 'trading_code' && onNavigate) {
      onNavigate('trading', { prefillCode: notif.data?.code });
    }
    setOpen(false);
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    api.post('/notifications/read-all').catch(() => {});
  };

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        className="relative w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border border-yellow-900/40 text-yellow-500 hover:bg-yellow-900/20 transition-all bg-transparent cursor-pointer"
      >
        <svg className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] sm:text-[10px] font-black">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-black border border-yellow-900/40 rounded-lg shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-yellow-900/20">
            <span className="font-black text-sm text-white">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[11px] text-yellow-500 font-bold hover:text-yellow-400 bg-transparent border-none cursor-pointer">
                TOUT MARQUER LU
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center py-8 text-gray-500 text-sm">Aucune notification</p>
            ) : (
              notifications.map(notif => (
                <button
                  key={notif._id}
                  onClick={() => handleClick(notif)}
                  className={`w-full text-left px-4 py-3 border-b border-yellow-900/10 hover:bg-yellow-900/10 transition-colors bg-transparent cursor-pointer ${!notif.read ? 'bg-yellow-900/5' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {!notif.read && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{notif.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{notif.message}</p>
                      <p className="text-[10px] text-gray-600 mt-1">{timeAgo(notif.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
