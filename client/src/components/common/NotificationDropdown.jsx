import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, ExternalLink, Calendar, Info, ShieldCheck, AlertCircle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'booking':
        return <Calendar size={14} className="text-teal-600" />;
      case 'verification':
        return <ShieldCheck size={14} className="text-emerald-600" />;
      case 'complaint':
        return <AlertCircle size={14} className="text-rose-600" />;
      default:
        return <Info size={14} className="text-blue-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded-full transition-colors"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-medium bg-teal-100 text-teal-800 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 transition-colors"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No notifications right now
              </div>
            ) : (
              notifications.slice(0, 6).map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && markAsRead(n._id)}
                  className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                    !n.isRead ? 'bg-teal-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-xs mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <p className={`text-xs truncate ${!n.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      {n.link && (
                        <Link
                          to={n.link}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-teal-600 hover:underline"
                        >
                          View Details <ExternalLink size={10} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-navy-800 hover:text-teal-600 transition-colors"
            >
              See all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

