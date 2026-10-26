import { useState } from 'react';
import { Copy, Check, Share2, Crown, CheckCircle2, Circle, Flame, Sparkles, Users } from 'lucide-react';
import { PublicRoomState } from '../types/game.ts';
import { AvatarDisplay } from '../components/Avatars.tsx';
import { Mascot } from '../components/ChaosCrew.tsx';
import { sound } from '../services/audio.ts';

interface LobbyScreenProps {
  roomState: PublicRoomState;
  onToggleReady: () => Promise<void>;
  onStartMatch: () => Promise<void>;
  onLeaveRoom: () => void;
}

export function LobbyScreen({
  roomState,
  onToggleReady,
  onStartMatch,
  onLeaveRoom
}: LobbyScreenProps) {
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const players = Object.values(roomState.players);
  const isHost = roomState.myPlayer?.isHost ?? false;
  const isReady = roomState.myPlayer?.isReady ?? false;
  const canStart = players.length >= 2;

  const handleCopy = () => {
    navigator.clipboard.writeText(roomState.code);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const url = `${window.location.origin}?join=${roomState.code}`;
    if (navigator.share) {
      navigator.share({
        title: 'Join my NEXORA Chaos Club',
        text: `Jump into my NEXORA party showdown! Room Code: ${roomState.code}`,
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      sound.playClick();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStart = async () => {
    if (!canStart) return;
    setStarting(true);
    setStartError(null);
    sound.playSuccess();
    try {
      await onStartMatch();
    } catch (err: any) {
      setStartError(err.message || 'Failed to start match.');
      setStarting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Arcade Ticket Room Code Card */}
      <div className="toy-card-yellow p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left relative overflow-hidden">
        {/* Decorative corner tag */}
        <div className="absolute -top-3 -right-3 bg-[#FF5DA2] text-white font-bubble text-[11px] px-6 py-1 rotate-12 border-2 border-[#302044] shadow-[1px_2px_0px_#302044]">
          OFFICIAL TICKET
        </div>

        <div className="space-y-1">
          <span className="font-bubble text-xs text-[#302044]/70 tracking-widest uppercase block">
            YOUR CHAOS CLUB CODE
          </span>
          <div className="font-bubble text-4xl sm:text-5xl font-black text-[#302044] tracking-widest font-mono-tabular drop-shadow-[2px_3px_0px_#FFFFFF]">
            {roomState.code}
          </div>
          <p className="text-xs font-semibold text-[#302044]/70">
            Tell your crew to enter this code on their device!
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleCopy}
            className="btn-chunky btn-chunky-white px-4 py-2.5 text-xs flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>COPIED!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#302044]" />
                <span>COPY CODE</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="btn-chunky btn-chunky-pink px-4 py-2.5 text-xs flex items-center gap-2"
          >
            <Share2 className="w-4 h-4 text-white" />
            <span>SHARE LINK</span>
          </button>
        </div>
      </div>

      {startError && (
        <div className="p-3.5 rounded-2xl bg-rose-100 border-2 border-rose-400 text-rose-800 text-xs font-bold text-center">
          {startError}
        </div>
      )}

      {/* Main Grid: Roster + Match Mode Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Players Roster (2 cols on md) */}
        <div className="md:col-span-2 toy-card p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#FFE6F1] border-2 border-[#302044]">
                <Users className="w-5 h-5 text-[#FF5DA2]" />
              </span>
              <div>
                <h3 className="font-bubble text-xl font-bold text-[#302044]">
                  Clubhouse Crew
                </h3>
                <span className="text-xs font-bold text-[#302044]/60">
                  {players.length} of 8 spots filled
                </span>
              </div>
            </div>

            <span className="font-bubble text-xs font-bold px-3 py-1 rounded-full bg-[#EFE9FF] border-2 border-[#302044] text-[#9B72FF]">
              {roomState.isDuelMode ? '⚔️ DUEL MODE' : '🎭 PARTY SHOWDOWN'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {players.map((p) => {
              const isMe = p.id === roomState.myPlayer?.id;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border-3 border-[#302044] transition-all ${
                    isMe
                      ? 'bg-[#FFF0B8] shadow-[3px_4px_0px_#302044]'
                      : 'bg-[#FFF8E9] shadow-[2px_3px_0px_#302044]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <AvatarDisplay avatarId={p.avatar} size="sm" showBorder={false} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bubble text-sm font-bold text-[#302044] truncate">
                          {p.name}
                        </span>
                        {p.isHost && (
                          <span title="Host">
                            <Crown className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-[#302044]/50 block">
                        {isMe ? '(You!)' : p.isHost ? 'Clubhouse Host' : 'Player'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center shrink-0">
                    {p.isReady ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#70E6BB] border-2 border-[#302044] text-[10px] font-bubble font-black text-[#302044] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-800" /> READY!
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-white border-2 border-[#302044] text-[10px] font-bubble font-bold text-[#302044]/50 flex items-center gap-1">
                        <Circle className="w-3 h-3" /> WAITING
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Empty slots with lonely mascot invitation */}
            {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-dashed border-[#302044]/30 bg-white/40 text-[#302044]/50 text-xs font-bubble font-bold"
              >
                <Mascot character="mochi" size="xs" />
                <span>Waiting for friend to join...</span>
              </div>
            ))}
          </div>

          {players.length === 1 && (
            <div className="p-4 rounded-2xl bg-[#FFF8E9] border-2 border-[#302044] flex items-center gap-4">
              <Mascot character="boom" expression="excited" size="sm" />
              <div className="text-xs">
                <strong className="font-bubble text-[#302044] block">IT'S A LITTLE QUIET IN HERE...</strong>
                <p className="text-[#302044]/70">Send your Chaos Code <span className="font-mono-tabular font-bold text-[#FF5DA2]">{roomState.code}</span> to at least 1 friend to begin!</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Panel & Match Settings */}
        <div className="space-y-4">
          <div className="toy-card-purple p-6 space-y-3">
            <h3 className="font-bubble text-lg font-bold text-[#302044] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#9B72FF]" /> Match Rules
            </h3>

            <div className="space-y-2 text-xs font-bold text-[#302044]/80">
              <div className="flex justify-between py-1 border-b-2 border-[#302044]/10">
                <span>Total Rounds:</span>
                <span className="text-[#302044]">{roomState.totalRounds} Rounds</span>
              </div>
              <div className="flex justify-between py-1 border-b-2 border-[#302044]/10">
                <span>Active Format:</span>
                <span className="text-[#9B72FF]">
                  {players.length === 2 ? 'Head-to-Head Duel' : 'Signal or Sabotage'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b-2 border-[#302044]/10">
                <span>Saboteur:</span>
                <span className="text-[#FF5DA2]">
                  {players.length === 2 ? 'Secret Duel Objectives' : '1 Covert Troublemaker'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#302044]/70 bg-white/70 p-3 rounded-xl border-2 border-[#302044]">
              {players.length === 2
                ? '2 players detected: Entering 2-Player Duel Mode with head-to-head predictions!'
                : '3+ players: Someone will secretly receive the Saboteur directive each round!'}
            </p>
          </div>

          {/* Controls Box */}
          <div className="toy-card p-5 space-y-3">
            {/* Ready Toggle */}
            <button
              onClick={() => {
                sound.playClick();
                onToggleReady();
              }}
              className={`w-full btn-chunky py-3 text-xs flex items-center justify-center gap-2 ${
                isReady
                  ? 'btn-chunky-white text-emerald-700 bg-emerald-50'
                  : 'btn-chunky-blue text-[#302044]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isReady ? "YOU'RE READY! (TAP TO CANCEL)" : "I'M READY TO PLAY!"}</span>
            </button>

            {/* Host Start Match Button */}
            {isHost && (
              <button
                onClick={handleStart}
                disabled={!canStart || starting}
                className={`w-full btn-chunky btn-chunky-pink py-4 text-sm flex items-center justify-center gap-2 ${
                  !canStart ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Flame className="w-5 h-5 text-[#FFD84D] fill-current" />
                <span>
                  {canStart
                    ? starting
                      ? 'UNLEASHING...'
                      : 'UNLEASH THE CHAOS!'
                    : 'NEED 2+ PLAYERS TO START'}
                </span>
              </button>
            )}

            {!isHost && (
              <p className="text-center text-[11px] font-bold text-[#302044]/60 italic">
                Waiting for the host to press UNLEASH THE CHAOS...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
