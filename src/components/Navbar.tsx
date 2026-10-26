import { useState } from 'react';
import { Volume2, VolumeX, Copy, Check, LogOut, HelpCircle, BookOpen, Sparkles } from 'lucide-react';
import { AuthUser } from '../services/api.ts';
import { AvatarDisplay } from './Avatars.tsx';
import { MusicPlayerWidget } from './MusicPlayerWidget.tsx';
import { InstallAppButton } from './InstallAppButton.tsx';
import { sound } from '../services/audio.ts';

interface NavbarProps {
  roomCode?: string;
  currentUser: AuthUser | null;
  onOpenHowToPlay: () => void;
  onOpenRules: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenProfile: () => void;
  onLeaveRoom?: () => void;
  onPlayNow?: () => void;
}

export function Navbar({
  roomCode,
  currentUser,
  onOpenHowToPlay,
  onOpenRules,
  onOpenAuth,
  onOpenProfile,
  onLeaveRoom,
  onPlayNow
}: NavbarProps) {
  const [muted, setMuted] = useState(sound.getMuted());
  const [copied, setCopied] = useState(false);

  const toggleSound = () => {
    const isMuted = sound.toggleMute();
    setMuted(isMuted);
    sound.playClick();
  };

  const copyRoomCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="relative z-30 flex items-center justify-between gap-4 px-4 sm:px-8 py-3 bg-white/95 backdrop-blur-md border-b-3 border-[#302044] shadow-[0_4px_16px_rgba(48,32,68,0.06)]">
      {/* Zone 1: Brand Wordmark with Official App Icon & Chaos Club Sticker */}
      <a
        href="/"
        onClick={(e) => {
          if (roomCode) e.preventDefault();
        }}
        className="flex items-center gap-2 sm:gap-2.5 group select-none shrink-0"
      >
        <img
          src="/pwa-192x192.png"
          alt="NEXORA"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border-2 border-[#302044] shadow-[1.5px_2px_0px_#302044] group-hover:scale-105 group-hover:rotate-3 transition-transform object-cover"
        />
        <div className="flex items-center">
          <span className="font-bubble text-2xl sm:text-3xl font-black tracking-tight text-[#FF5DA2] group-hover:scale-105 transition-transform">
            NEX
          </span>
          <span className="font-bubble text-2xl sm:text-3xl font-black tracking-tight text-[#53CFFF] group-hover:scale-105 transition-transform">
            ORA
          </span>
        </div>

        {/* Sticker badge */}
        <span className="hidden xs:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFD84D] border-2 border-[#302044] text-[10px] font-bubble font-black tracking-wider text-[#302044] -rotate-3 shadow-[1.5px_2px_0px_#302044] group-hover:rotate-3 transition-transform">
          <Sparkles className="w-2.5 h-2.5 text-[#FF5DA2]" />
          CHAOS CLUB
        </span>
      </a>

      {/* Zone 2: Navigation Links, Audio & PWA Install */}
      <nav className="flex items-center gap-2 sm:gap-3 text-xs font-bold text-[#302044]">
        {/* In-App PWA Install Button */}
        <InstallAppButton variant="navbar" />
        <button
          onClick={() => {
            sound.playClick();
            onOpenHowToPlay();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFF8E9] border-2 border-[#302044] shadow-[2px_2px_0px_#302044] active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <HelpCircle className="w-4 h-4 text-[#FF5DA2]" />
          <span className="hidden md:inline font-bubble">How to Play</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenRules();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFF8E9] border-2 border-[#302044] shadow-[2px_2px_0px_#302044] active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <BookOpen className="w-4 h-4 text-[#9671FF]" />
          <span className="hidden md:inline font-bubble">Rules</span>
        </button>

        {/* Theme Music Player Control */}
        <MusicPlayerWidget compact={true} />

        {/* SFX Mute/Unmute */}
        <button
          onClick={toggleSound}
          className="p-1.5 rounded-xl bg-white hover:bg-[#FFF8E9] border-2 border-[#302044] shadow-[2px_2px_0px_#302044] text-[#302044] transition-all cursor-pointer"
          title={muted ? 'Turn SFX On' : 'Mute SFX'}
          aria-label={muted ? 'Turn SFX On' : 'Mute SFX'}
        >
          {muted ? (
            <VolumeX className="w-4 h-4 text-slate-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#65DDB0]" />
          )}
        </button>

        {roomCode && (
          <button
            onClick={copyRoomCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFD84D] border-2 border-[#302044] shadow-[2px_2px_0px_#302044] font-mono-tabular text-xs font-bold text-[#302044] hover:bg-[#FFE170] active:translate-y-0.5 transition-all cursor-pointer"
            title="Click to copy ticket code"
          >
            <span className="text-[#302044]/70 text-[10px]">ROOM:</span>
            <span className="tracking-wider">{roomCode}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-800" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#302044]" />
            )}
          </button>
        )}
      </nav>

      {/* Zone 3: User Auth / Account / Room Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        {roomCode && onLeaveRoom ? (
          <button
            onClick={() => {
              sound.playClick();
              onLeaveRoom();
            }}
            className="btn-chunky btn-chunky-white px-3.5 py-1.5 text-xs text-rose-600 border-2 border-[#302044] shadow-[2px_2px_0px_#302044]"
          >
            <LogOut className="w-3.5 h-3.5 inline mr-1" />
            <span className="hidden sm:inline">Leave Club</span>
          </button>
        ) : currentUser ? (
          <button
            onClick={() => {
              sound.playClick();
              onOpenProfile();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white hover:bg-[#FFF9E6] border-2 border-[#302044] shadow-[2px_2px_0px_#302044] transition-all cursor-pointer"
            title="Open Clubhouse Passport"
          >
            <AvatarDisplay avatarId={currentUser.avatar} size="xs" showBorder={false} />
            <span className="font-bubble text-xs font-bold text-[#302044] hidden sm:inline truncate max-w-[100px]">
              {currentUser.displayName}
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onOpenAuth('login');
              }}
              className="btn-chunky btn-chunky-white px-3.5 py-1.5 text-xs"
            >
              Log In
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onOpenAuth('register');
              }}
              className="btn-chunky btn-chunky-pink px-3.5 py-1.5 text-xs hidden sm:inline"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
