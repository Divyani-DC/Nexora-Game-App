import React, { useEffect, useState } from 'react';

interface LaunchScreenProps {
  onFinish?: () => void;
}

export const LaunchScreen: React.FC<LaunchScreenProps> = ({ onFinish }) => {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Fast simulated initialization progress
    const t1 = setTimeout(() => setProgress(65), 300);
    const t2 = setTimeout(() => setProgress(100), 750);
    const t3 = setTimeout(() => setFading(true), 1050);
    const t4 = setTimeout(() => {
      setVisible(false);
      onFinish?.();
    }, 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-350 select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="NEXORA Launch Screen"
    >
      <div className="relative flex flex-col items-center max-w-xs px-6 text-center">
        {/* Official Glossy Artwork App Icon */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#FF5DA2]/30 via-[#53CFFF]/30 to-[#FFD84D]/30 blur-xl animate-pulse" />
          <img
            src="/pwa-512x512.png"
            alt="NEXORA: The Chaos Club"
            className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl border-3 border-[#302044] shadow-[6px_6px_0px_#302044] object-cover animate-bounce"
            style={{ animationDuration: '2s' }}
          />
        </div>

        {/* Brand Tagline */}
        <h1 className="font-bubble text-2xl font-black text-[#302044] tracking-tight">
          NEXORA
        </h1>
        <p className="font-bubble text-xs font-bold text-[#FF5DA2] tracking-wider uppercase mt-1">
          THE CHAOS CLUB
        </p>

        {/* Loading Progress Bar */}
        <div className="w-56 h-3.5 mt-6 rounded-full bg-[#FFF8E9] border-2 border-[#302044] overflow-hidden p-0.5 shadow-[2px_2px_0px_#302044]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FF5DA2] via-[#FFD84D] to-[#53CFFF] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-[11px] font-bold text-[#302044]/60 mt-2 font-mono">
          PREPARING ARENA... {progress}%
        </p>
      </div>
    </div>
  );
};
