import { useState } from 'react';
import { EyeOff, Check, Sparkles, Shield, AlertTriangle } from 'lucide-react';
import { PublicRoomState } from '../types/game.ts';
import { TimerRing } from '../components/TimerRing.tsx';
import { Mascot } from '../components/ChaosCrew.tsx';
import { sound } from '../services/audio.ts';

interface BriefingScreenProps {
  roomState: PublicRoomState;
  onAcknowledge: () => Promise<void>;
}

export function BriefingScreen({ roomState, onAcknowledge }: BriefingScreenProps) {
  const [acknowledged, setAcknowledged] = useState(roomState.myPlayer?.briefingAcknowledged ?? false);
  const privateState = roomState.myPrivateState;

  const isSaboteur = privateState?.role === 'SABOTEUR';
  const isDuelist = privateState?.role === 'DUELIST_ALPHA' || privateState?.role === 'DUELIST_OMEGA';

  const handleAcknowledge = async () => {
    setAcknowledged(true);
    sound.playClick();
    try {
      await onAcknowledge();
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Cartoon Top Warning */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD84D] border-3 border-[#302044] text-[#302044] text-xs font-bubble font-black tracking-wider shadow-[2px_3px_0px_#302044] -rotate-1">
          <EyeOff className="w-4 h-4 text-[#FF5DA2]" />
          <span>TOP SECRET BRIEFING · ROUND {roomState.round} OF {roomState.totalRounds}</span>
        </div>
        <h2 className="font-bubble text-3xl sm:text-4xl font-black text-[#302044] mt-3">
          Cover Your Screen!
        </h2>
        <p className="text-xs font-bold text-[#302044]/70 mt-1">
          Keep this strictly between you and your inner chaos.
        </p>
      </div>

      {/* Role Card */}
      <div
        className={`p-6 sm:p-8 space-y-6 ${
          isSaboteur
            ? 'toy-card-pink'
            : isDuelist
            ? 'toy-card-purple'
            : 'toy-card-yellow'
        }`}
      >
        <div className="flex items-center justify-between gap-4 pb-6 border-b-3 border-[#302044]">
          <div className="flex items-center gap-4">
            <Mascot
              character={isSaboteur ? 'pickle' : isDuelist ? 'zap' : 'pip'}
              expression={isSaboteur ? 'suspicious' : 'excited'}
              size="lg"
              animate={true}
            />
            <div>
              <span className="text-[11px] font-bubble font-bold text-[#302044]/70 tracking-widest uppercase block">
                YOUR SECRET ROLE
              </span>
              <span
                className={`font-bubble text-3xl sm:text-4xl font-black ${
                  isSaboteur
                    ? 'text-[#FF5DA2] drop-shadow-[2px_2px_0px_#302044]'
                    : 'text-[#302044]'
                }`}
              >
                {privateState?.roleTitle || 'Signal Agent'}
              </span>
            </div>
          </div>

          <TimerRing timerEndsAt={roomState.timerEndsAt} totalDuration={roomState.timerTotalDuration} size={62} />
        </div>

        {/* Private Directive */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border-3 border-[#302044] shadow-[3px_4px_0px_#302044]">
            <span className="font-bubble text-xs font-black text-[#FF5DA2] block mb-1">
              ✦ YOUR SECRET GOAL THIS ROUND
            </span>
            <p className="text-sm font-extrabold text-[#302044] leading-relaxed">
              {privateState?.objective || 'Solve the incoming challenge accurately.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 border-2 border-[#302044]">
            <span className="font-bubble text-xs font-bold text-[#302044]/60 block mb-1">
              TACTICAL ADVICE
            </span>
            <p className="text-xs font-semibold text-[#302044]/80 leading-relaxed">
              {privateState?.secretInstructions ||
                'Answer the challenge, watch out for sneaky moves, and protect the clubhouse!'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleAcknowledge}
            disabled={acknowledged}
            className={`w-full btn-chunky py-4 text-sm flex items-center justify-center gap-2 ${
              acknowledged
                ? 'btn-chunky-white text-emerald-800 bg-emerald-100 opacity-90 cursor-default'
                : isSaboteur
                ? 'btn-chunky-pink'
                : 'btn-chunky-blue'
            }`}
          >
            {acknowledged ? (
              <>
                <Check className="w-5 h-5 text-emerald-700 stroke-[3]" />
                <span>OBJECTIVE MEMORIZED! WAITING FOR PUZZLE...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>I'VE GOT MY MISSION! ✦</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
