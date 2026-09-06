import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount: number;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
}) => {
  return (
    <div className="flex justify-center items-center py-4 sm:py-8 px-2 sm:px-4">
      {/* Android Device Outer Bezel */}
      <div className="relative w-full max-w-[430px] rounded-[48px] bg-slate-950 p-3 shadow-2xl ring-1 ring-slate-800 border-4 border-slate-800 min-h-[840px] flex flex-col">
        {/* Device Speaker & Front Camera Hole Punch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-black ring-2 ring-slate-900 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-950"></div>
          </div>
        </div>

        {/* Android Status Bar */}
        <div className="h-9 px-6 pt-1 flex items-center justify-between text-white text-[11px] font-semibold select-none z-40">
          <span className="font-mono tracking-tight">10:44</span>
          <div className="flex items-center space-x-2">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <BatteryMedium className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Screen Content Window */}
        <div className="flex-1 bg-slate-50 rounded-[36px] overflow-y-auto overflow-x-hidden flex flex-col relative pb-4">
          {children}
        </div>

        {/* Android Gesture Bar */}
        <div className="h-5 flex items-center justify-center pt-1 z-40">
          <div className="w-32 h-1 bg-slate-600/70 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
