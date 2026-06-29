import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Trash2, ShieldAlert, Sparkles, Trophy, Calendar, CheckCheck, X, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export const NotificationsPage: React.FC = () => {
  const { notifications, setNotifications, markNotificationsAsRead } = useApp();
  const [clearingAll, setClearingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case 'rescue':
        return <ShieldAlert size={16} className="text-rose-400" />;
      case 'coach':
        return <Sparkles size={16} className="text-violet-400" />;
      case 'gamification':
        return <Trophy size={16} className="text-amber-400" />;
      case 'calendar':
        return <Calendar size={16} className="text-cyan-400" />;
      default:
        return <Bell size={16} className="text-neutral-400" />;
    }
  };

  const getBorderColor = (type: string, read: boolean) => {
    if (read) return 'border-neutral-800 bg-neutral-900/10';
    switch (type) {
      case 'rescue':
        return 'border-rose-500/20 bg-rose-950/5';
      case 'coach':
        return 'border-violet-500/20 bg-violet-950/5';
      case 'gamification':
        return 'border-amber-500/20 bg-amber-950/5';
      case 'calendar':
        return 'border-cyan-500/20 bg-cyan-950/5';
      default:
        return 'border-neutral-700 bg-neutral-800/10';
    }
  };

  // Delete a single notification
  const handleDelete = async (notifId: string) => {
    if (deletingId) return;
    setDeletingId(notifId);

    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== notifId));

    try {
      await fetch(`${API_BASE}/notifications/${notifId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
    } catch {
      // Rollback — re-fetch would be ideal but just leave optimistic delete
    } finally {
      setDeletingId(null);
    }
  };

  // Mark all as read + hit backend
  const handleMarkAllRead = async () => {
    markNotificationsAsRead(); // updates context state (also hits /api/user/notifications/read)
  };

  // Clear all read notifications
  const handleClearRead = async () => {
    if (clearingAll) return;
    setClearingAll(true);

    // Optimistic update — remove read ones
    setNotifications(prev => prev.filter(n => !n.read));

    try {
      await fetch(`${API_BASE}/notifications/clear`, {
        method: 'DELETE',
        credentials: 'include'
      });
    } catch {
      // Silently fail — optimistic state remains
    } finally {
      setClearingAll(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.filter(n => n.read).length;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">Notifications</h2>
          <p className="text-sm text-neutral-400 mt-1">Real-time alerts, rescue system actions, and agent suggestions.</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white border border-neutral-800 rounded-lg hover:bg-neutral-900 transition-colors"
            >
              <CheckCheck size={13} />
              <span>Mark all read</span>
            </button>
          )}
          {readCount > 0 && (
            <button
              onClick={handleClearRead}
              disabled={clearingAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-rose-300 border border-neutral-800 rounded-lg hover:bg-rose-950/20 transition-colors disabled:opacity-50"
            >
              {clearingAll ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              <span>Clear read</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-glass-border rounded-2xl bg-[#0a0c16]/30 space-y-3 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-glass-border flex items-center justify-center text-text-muted mb-1">
              <Bell size={24} />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">All caught up</h3>
            <p className="text-xs text-text-muted max-w-xs mx-auto">
              No new workspace notifications or real-time agent alerts at this time.
            </p>
          </div>
        ) : (
          [...notifications]
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
            .map(n => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border flex gap-3.5 transition-all group ${getBorderColor(n.type, n.read)}`}
              >
                <div className="pt-0.5 select-none">{getIcon(n.type)}</div>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      {n.title}
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block animate-pulse" />
                      )}
                    </h4>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] text-neutral-500 font-mono">{n.timestamp}</span>
                      <button
                        onClick={() => handleDelete(n.id)}
                        disabled={deletingId === n.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-neutral-600 hover:text-rose-400"
                        title="Delete notification"
                      >
                        {deletingId === n.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <X size={12} />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};
