import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, ArrowLeft, MoreVertical } from 'lucide-react';

interface AndroidEmulatorFrameProps {
  children: React.ReactNode;
  title: string;
  onBack?: () => void;
  showBack?: boolean;
}

export const AndroidEmulatorFrame: React.FC<AndroidEmulatorFrameProps> = ({
  children,
  title,
  onBack,
  showBack = false,
}) => {
  const [deviceTime, setDeviceTime] = useState<string>('12:00 PM');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDeviceTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center items-center py-6 min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
      {/* Outer Shell Wrapper */}
      <div className="relative w-full max-w-[410px] aspect-[9/19.5] min-h-[790px] bg-neutral-950 rounded-[48px] shadow-2xl border-[10px] border-neutral-900 ring-4 ring-neutral-800/50 overflow-hidden flex flex-col justify-between">
        
        {/* Screen Glare reflection overlay */}
        <div className="absolute inset-0 pointer-events-none reflection-glare z-40 rounded-[38px]" />

        {/* Top Speaker / Notch Earpiece */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-neutral-900 rounded-full z-50" />
        
        {/* Punch Hole Camera (Dynamic Island simulator) */}
        <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-4 h-4 bg-black border border-neutral-900 rounded-full z-50 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-neutral-950 rounded-full" />
        </div>

        {/* Phone Status Bar */}
        <div className="absolute top-0 inset-x-0 h-10 px-6 flex justify-between items-center text-[11px] font-sans font-medium text-slate-100 select-none z-30 pt-2 bg-neutral-950/20 backdrop-blur-[2px]">
          {/* Time on leftmost part */}
          <span>{deviceTime}</span>
          
          {/* Hardware Indicators on rightmost part */}
          <div className="flex items-center gap-1.5">
            <Signal size={12} className="text-slate-100" />
            <Wifi size={12} className="text-slate-100" />
            <div className="flex items-center gap-0.5">
              <span className="text-[9px]">98%</span>
              <Battery size={13} className="text-slate-100" />
            </div>
          </div>
        </div>

        {/* Screen Content Window */}
        <div className="flex-1 flex flex-col pt-10 pb-4 bg-slate-950 text-slate-100 h-full overflow-hidden relative">
          
          {/* AppBar simulator */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-3">
              {showBack && onBack ? (
                <button 
                  onClick={onBack}
                  id="btn-emulator-back"
                  className="p-1 px-1.5 rounded-full hover:bg-slate-900 text-slate-100 active:scale-95 transition-transform"
                >
                  <ArrowLeft size={20} />
                </button>
              ) : (
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </div>
              )}
              <h1 className="font-display font-bold text-base leading-none text-slate-100">{title}</h1>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-900 border border-slate-800/50 px-1.5 py-0.5 rounded">
                LOCAL TIME ONLY
              </span>
              <MoreVertical size={16} className="text-slate-400" />
            </div>
          </div>

          {/* Child frame scroll container */}
          <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
            {children}
          </div>

        </div>

        {/* Android Navigation Bar (Bottom Gesture Bar) */}
        <div className="absolute bottom-1 inset-x-0 h-6 flex justify-center items-center z-40 bg-transparent pointer-events-none">
          <div className="w-32 h-1 bg-neutral-700/80 rounded-full" />
        </div>

      </div>

      {/* Side Hardware Buttons */}
      <div className="hidden md:flex flex-col gap-6 ml-4 absolute left-[calc(50%+218px)]">
        {/* Power Button */}
        <div className="w-1.5 h-12 bg-neutral-800 rounded-r border-r border-neutral-700 shadow-md" />
        {/* Volume up/down combo */}
        <div className="w-1.5 h-20 bg-neutral-800 rounded-r border-r border-neutral-700 shadow-md" />
      </div>
    </div>
  );
};
