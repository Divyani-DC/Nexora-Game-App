import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Sparkles, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';
import { sound } from '../services/audio.ts';

interface InstallAppButtonProps {
  variant?: 'navbar' | 'hero' | 'floating';
  className?: string;
}

export const InstallAppButton: React.FC<InstallAppButtonProps> = ({ variant = 'navbar', className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already installed, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    sound.playClick();
    if (isInstallable) {
      setIsInstalling(true);
      await install();
      setIsInstalling(false);
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // In case beforeinstallprompt hasn't fired yet or browser uses generic manual add
      setShowIOSGuide(true);
    }
  };

  const renderButton = () => {
    if (variant === 'hero') {
      return (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`group flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white hover:bg-[#FFF9E6] border-3 border-[#302044] shadow-[4px_4px_0px_#302044] active:translate-y-1 active:shadow-[1px_1px_0px_#302044] font-bubble text-sm sm:text-base font-black text-[#302044] transition-all cursor-pointer ${className}`}
        >
          <div className="w-8 h-8 rounded-xl bg-[#53CFFF] border-2 border-[#302044] flex items-center justify-center text-[#302044] group-hover:rotate-6 transition-transform">
            <Download className="w-4 h-4 text-[#302044]" />
          </div>
          <div className="text-left">
            <span className="block text-xs font-bold text-[#FF5DA2] uppercase tracking-wider">Install NEXORA</span>
            <span className="block text-sm sm:text-base font-black leading-none">Play Fullscreen</span>
          </div>
        </button>
      );
    }

    if (variant === 'floating') {
      return (
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#FFD84D] hover:bg-[#FFE066] border-2 border-[#302044] shadow-[3px_3px_0px_#302044] font-bubble text-xs font-black text-[#302044] active:translate-y-0.5 transition-all cursor-pointer ${className}`}
          title="Install NEXORA to Home Screen"
        >
          <Smartphone className="w-4 h-4 text-[#302044]" />
          <span>Install App</span>
        </button>
      );
    }

    // Default 'navbar' variant
    return (
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#53CFFF] hover:bg-[#40C5FA] border-2 border-[#302044] shadow-[2px_2px_0px_#302044] text-[#302044] font-bubble text-xs font-bold active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${className}`}
        title="Install NEXORA like a real mobile game"
      >
        <Download className="w-3.5 h-3.5 text-[#302044]" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  };

  return (
    <>
      {renderButton()}

      {/* iOS & Manual Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#302044]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-white border-3 border-[#302044] shadow-[8px_8px_0px_#302044] p-6 overflow-hidden">
            {/* Header Sticker */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <img src="/pwa-192x192.png" alt="NEXORA" className="w-10 h-10 rounded-xl border-2 border-[#302044] shadow-[2px_2px_0px_#302044]" />
                <div>
                  <h3 className="font-bubble text-lg font-black text-[#302044] leading-tight">Install NEXORA</h3>
                  <p className="text-[11px] font-bold text-[#FF5DA2]">Add to your home screen</p>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  setShowIOSGuide(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border-2 border-[#302044] flex items-center justify-center text-[#302044] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction Steps */}
            <div className="space-y-3 my-4">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FFF8E9] border-2 border-[#302044]/20">
                <div className="w-7 h-7 rounded-xl bg-[#53CFFF] border-2 border-[#302044] flex items-center justify-center shrink-0 text-[#302044]">
                  <Share2 className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bubble font-black text-[#302044]">Step 1: Tap Share</span>
                  <p className="text-[#302044]/70 font-semibold mt-0.5">
                    Tap the <strong>Share</strong> button at the bottom of Safari (or browser menu ⋮ on Android).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FFF8E9] border-2 border-[#302044]/20">
                <div className="w-7 h-7 rounded-xl bg-[#FFD84D] border-2 border-[#302044] flex items-center justify-center shrink-0 text-[#302044]">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bubble font-black text-[#302044]">Step 2: Add to Home Screen</span>
                  <p className="text-[#302044]/70 font-semibold mt-0.5">
                    Scroll down and tap <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FF5DA2]/10 border-2 border-[#FF5DA2]/30">
                <div className="w-7 h-7 rounded-xl bg-[#FF5DA2] border-2 border-[#302044] flex items-center justify-center shrink-0 text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bubble font-black text-[#302044]">Instant Mobile Gaming</span>
                  <p className="text-[#302044]/70 font-semibold mt-0.5">
                    Launches instantly in full-screen standalone mode with zero browser clutter!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setShowIOSGuide(false);
              }}
              className="w-full py-2.5 rounded-2xl bg-[#FF5DA2] hover:bg-[#FF39A8] border-2 border-[#302044] shadow-[3px_3px_0px_#302044] active:translate-y-0.5 text-white font-bubble text-sm font-black transition-all cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
