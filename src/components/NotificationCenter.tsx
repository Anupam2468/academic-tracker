import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Calendar, 
  Check, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Clock, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { AcademicNotification } from '../types';

interface NotificationCenterProps {
  notifications: AcademicNotification[];
  onMarkAllRead: () => void;
  onDeleteNotif: (id: string) => void;
  onJumpToTask?: (taskId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAllRead,
  onDeleteNotif,
  onJumpToTask,
}) => {
  const [filter, setFilter] = useState<'all' | 'date_changed' | 'cancelled' | 'due_soon'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showAndroidDrawerPreview, setShowAndroidDrawerPreview] = useState(false);

  // Play gentle web audio chime
  const playAlertChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch (e) {
      console.warn('AudioContext not allowed or not supported:', e);
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base sm:text-lg font-bold text-white/90">
              Academic Notifications & Alarms
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-white/50 mt-0.5">
            Real-time proactive notifications for date extensions, exam rescheduling, cancellations, and upcoming deadlines.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playAlertChime();
            }}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              soundEnabled 
                ? 'bg-white/10 text-white/80 border-white/10' 
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}
            title={soundEnabled ? 'Mute Alert Chime' : 'Unmute Alert Chime'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Chime On' : 'Muted'}</span>
          </button>

          <button
            onClick={() => setShowAndroidDrawerPreview(!showAndroidDrawerPreview)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              showAndroidDrawerPreview
                ? 'bg-blue-500 text-white border-blue-500 shadow-xs'
                : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android Push Preview</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="px-3 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors"
            >
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Android System Notification Drawer Simulation Banner */}
      {showAndroidDrawerPreview && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white shadow-md border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">Android Notification Shade (FCM & Local AlarmManager)</span>
            </div>
            <span className="font-mono text-slate-400 text-[11px]">10:44 AM • 5G</span>
          </div>

          <div className="mt-3 space-y-3">
            {notifications.slice(0, 3).map((notif) => (
              <div 
                key={`drawer-${notif.id}`} 
                className="bg-slate-800/90 rounded-xl p-3.5 border border-slate-700/60 shadow-xs text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="font-bold text-slate-200 uppercase tracking-wider">CGU Academic Tracker</span>
                    <span>•</span>
                    <span>Just now</span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">High Priority</span>
                </div>

                <div className="font-bold text-white text-sm">
                  {notif.title}
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">
                  {notif.message}
                </p>

                <div className="flex items-center space-x-3 pt-2 text-[11px] font-semibold text-blue-400">
                  <button className="hover:text-blue-300">OPEN IN APP</button>
                  <button className="hover:text-blue-300">ADD TO CALENDAR</button>
                  <button className="hover:text-blue-300">SNOOZE 2 HOURS</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-2 text-xs font-semibold">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'date_changed', label: '🚨 Date Changes & Extensions' },
          { id: 'cancelled', label: '🛑 Cancellations' },
          { id: 'due_soon', label: '⏳ Due Near Alarms' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === tab.id
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white/90 hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white/40">
            <Bell className="w-10 h-10 mx-auto mb-2 text-white/20" />
            <p className="text-xs font-medium">No notifications in this category.</p>
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition-all bg-white/5 backdrop-blur-md shadow-xs ${
                !notif.read ? 'border-l-4 border-l-blue-500 border-white/10' : 'border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    notif.type === 'date_changed'
                      ? 'bg-amber-500/20 text-amber-300'
                      : notif.type === 'cancelled'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {notif.type === 'date_changed' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : notif.type === 'cancelled' ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-white/90">
                        {notif.title}
                      </h4>
                      {notif.subject && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/10 text-white/80 border border-white/10">
                          {notif.subject}
                        </span>
                      )}
                      {!notif.read && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 uppercase">
                          New
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-white/60 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center space-x-3 mt-2 text-[11px] text-white/40">
                      <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span className="capitalize">{notif.source.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  {notif.relatedTaskId && onJumpToTask && (
                    <button
                      onClick={() => onJumpToTask(notif.relatedTaskId!)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-400 hover:bg-blue-500/10 transition-colors flex items-center space-x-1"
                    >
                      <span>View Task</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteNotif(notif.id)}
                    className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Dismiss"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
