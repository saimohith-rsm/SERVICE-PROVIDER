import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, ExternalLink, Calendar, ShieldCheck, AlertCircle, Info } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const NotificationsPage = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'booking':
        return <Calendar size={18} className="text-teal-600" />;
      case 'verification':
        return <ShieldCheck size={18} className="text-emerald-600" />;
      case 'complaint':
        return <AlertCircle size={18} className="text-rose-600" />;
      default:
        return <Info size={18} className="text-blue-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-900">Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Status changes, appointment updates, and system communications.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-teal-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <CheckCheck size={16} /> Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="You'll be alerted whenever a service provider confirms an appointment or updates its progress."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markAsRead(n._id)}
              className={`p-5 hover:bg-slate-50/70 transition-colors flex items-start gap-4 cursor-pointer ${
                !n.isRead ? 'bg-teal-50/20' : ''
              }`}
            >
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-xs mt-0.5 shrink-0">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3
                    className={`text-sm truncate ${
                      !n.isRead ? 'font-bold text-navy-900' : 'font-medium text-slate-700'
                    }`}
                  >
                    {n.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-2">{n.message}</p>
                {n.link && (
                  <Link
                    to={n.link}
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:underline"
                  >
                    Open View <ExternalLink size={12} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;

