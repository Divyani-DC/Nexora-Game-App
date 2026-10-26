import React, { useEffect, useState } from 'react';
import { Sparkles, Trophy, Play, X, Zap } from 'lucide-react';
import { Confetti } from './Confetti.tsx';
import { sound } from '../services/audio.ts';

export const InstallWelcomeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      const justInstalled = localStorage.getItem('nexora_just_installed') === 'true';
      const welcomeShown = localStorage.getItem('nexora_installed_welcome_shown') === 'true';

      if ((justInstalled || isStandalone) && !welcomeShown) {
        setIsOpen(true);
        sound.playVictory();
      }
    } catch {
      // ignore
    }
  }, []);

  const handleDismiss = () => {
    sound.playClick();
    try {
      localStorage.setItem('nexora_installed_welcome_shown', 'true');
      localStorage.removeItem('nexora_just_installed');
    } catch {
      // ignore
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#302044]/70 backdrop-blur-md animate-in fade-in duration-300">
      <Confetti durationMs={4500} />

      <div className="relative w-full max-w-md rounded-3xl bg-white border-3 border-[#302044] shadow-[10px_10px_0px_#302044] p-6 sm:p-8 text-center overflow-hidden animate-in zoom-in-95 duration-200">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border-2 border-[#302044] flex items-center justify-center text-[#302044] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Central Logo & Mascot Badge */}
        <div className="relative inline-block my-2">
          <img
            src="/pwa-192x192.png"
            alt="NEXORA Installed"
            className="w-24 h-24 mx-auto rounded-3xl border-3 border-[#302044] shadow-[4px_4px_0px_#302044] animate-bounce"
          />
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-[#FFD84D] border-2 border-[#302044] font-bubble text-[11px] font-black text-[#302044] shadow-[2px_2px_0px_#302044]">
            INSTALLED!
          </span>
        </div>

        <h2 className="font-bubble text-2xl sm:text-3xl font-black text-[#302044] mt-3 tracking-tight">
          YOUR CHAOS CLUB IS READY!
        </h2>

        <p className="text-sm font-bold text-[#FF5DA2] mt-1">
          NEXORA is now installed on your device like a real mobile game!
        </p>

        <div className="mt-4 p-4 rounded-2xl bg-[#FFF8E9] border-2 border-[#302044]/20 text-left space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF5DA2] shrink-0" />
            <span className="font-semibold text-[#302044]">Full-screen standalone game experience with zero url bars</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#53CFFF] shrink-0" />
            <span className="font-semibold text-[#302044]">Lightning-fast cached shell loading</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#FFD84D] shrink-0" />
            <span className="font-semibold text-[#302044]">Instant party room creation & joining with your crew</span>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="mt-6 w-full py-3.5 rounded-2xl bg-[#FF5DA2] hover:bg-[#FF39A8] border-3 border-[#302044] shadow-[4px_4px_0px_#302044] active:translate-y-1 active:shadow-[1px_1px_0px_#302044] text-white font-bubble text-base font-black transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-white text-white" />
          START PLAYING!
        </button>
      </div>
    </div>
  );
};
