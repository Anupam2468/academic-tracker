import React from 'react';
import { 
  GraduationCap, 
  Smartphone, 
  Monitor, 
  Bell, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  Calendar as CalendarIcon 
} from 'lucide-react';

interface HeaderProps {
  currentSimulatedDate: string;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  unreadNotifsCount: number;
  onOpenNotifications: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentSimulatedDate,
  isMobileFrame,
  setIsMobileFrame,
  unreadNotifsCount,
  onOpenNotifications,
  onRefreshData,
  isRefreshing,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/5 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Institution Info */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.4)]">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white">
                  Nexus AI <span className="text-teal-400">Track</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                  AI Brain: Optimal
                </span>
              </div>
              <p className="text-xs text-slate-400 uppercase tracking-widest mt-0.5">
                C. V. Raman Global University
              </p>
            </div>
          </div>

          {/* Simulated Date Badge & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden md:flex items-center bg-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-300 border border-white/10">
              <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
              <span className="font-semibold text-slate-200 mr-1">Current Date:</span>
              <span className="font-mono text-teal-300 font-semibold">{currentSimulatedDate}</span>
            </div>

            {/* View Mode Toggle: Android Mobile Frame vs Expanded */}
            <div className="flex items-center bg-white/5 p-0.5 rounded-lg border border-white/10">
              <button
                id="btn-view-desktop"
                onClick={() => setIsMobileFrame(false)}
                title="Expanded Desktop/Tablet View"
                className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                  !isMobileFrame
                    ? 'bg-white/10 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                id="btn-view-mobile"
                onClick={() => setIsMobileFrame(true)}
                title="Android Smartphone Frame View"
                className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                  isMobileFrame
                    ? 'bg-white/10 text-teal-400 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              id="btn-header-refresh"
              onClick={onRefreshData}
              disabled={isRefreshing}
              title="Sync All Data"
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
            </button>

            {/* Notification Bell with Badge */}
            <button
              id="btn-header-notifications"
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Open notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500/20 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                  {unreadNotifsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
