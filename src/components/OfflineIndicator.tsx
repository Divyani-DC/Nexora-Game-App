import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-3 p-3.5 rounded-2xl bg-[#302044] border-2 border-[#FFD84D] text-white shadow-[4px_4px_0px_#FFD84D] animate-in slide-in-from-bottom duration-300">
      <div className="w-8 h-8 rounded-xl bg-amber-400 text-[#302044] flex items-center justify-center shrink-0">
        <WifiOff className="w-4 h-4" />
      </div>
      <div className="flex-1 text-xs">
        <p className="font-bubble font-black text-[#FFD84D]">Offline Mode Detected</p>
        <p className="text-white/80 text-[11px] font-medium leading-tight mt-0.5">
          Cached app shell is active. Reconnect to join real-time multiplayer rooms!
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
        title="Retry connection"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  );
};
