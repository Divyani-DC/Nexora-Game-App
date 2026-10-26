import { useEffect } from 'react';
import { Award, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { PublicRoomState } from '../types/game.ts';
import { AvatarDisplay } from '../components/Avatars.tsx';
import { Mascot } from '../components/ChaosCrew.tsx';
import { TimerRing } from '../components/TimerRing.tsx';
import { sound } from '../services/audio.ts';

interface RevealScreenProps {
  roomState: PublicRoomState;
}

export function RevealScreen({ roomState }: RevealScreenProps) {
  const result = roomState.latestResult;
  const players = Object.values(roomState.players);
  const isDuel = roomState.isDuelMode;

  useEffect(() => {
    sound.playSuccess();
  }, []);

  const saboteurPlayer = result?.saboteurId ? roomState.players[result.saboteurId] : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner: Round Climax Header */}
      <div className="toy-card-yellow p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <Mascot character="boom" expression="celebrating" size="md" animate={true} />
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FF5DA2] text-white font-bubble text-xs font-black tracking-wider border-2 border-[#302044] shadow-[1px_2px_0px_#302044] mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>ROUND {roomState.round} REVEAL & SCORING</span>
            </div>
            <h2 className="font-bubble text-2xl sm:text-3xl font-black text-[#302044]">
              {result?.challengeTitle || 'The Big Reveal!'}
            </h2>
            <p className="text-xs font-bold text-[#302044]/70 mt-0.5">
              The dust settles! Let's see who crushed it and who got totally exposed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-bubble font-bold text-[#302044]/60 uppercase block">Next Round In</span>
            <span className="text-xs font-black text-[#302044]">Auto-countdown</span>
          </div>
          <TimerRing timerEndsAt={roomState.timerEndsAt} totalDuration={roomState.timerTotalDuration} size={62} />
        </div>
      </div>

      {/* Saboteur Spotlight (Saboteur Mode only) */}
      {!isDuel && (
        <div
          className={`p-6 sm:p-7 ${
            result?.saboteurSuccess ? 'toy-card-pink' : 'toy-card-mint'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <Mascot
                character="pickle"
                expression={result?.saboteurSuccess ? 'celebrating' : 'shocked'}
                size="lg"
                animate={true}
              />
              <div>
                <span className="font-bubble text-xs font-black text-[#302044] uppercase tracking-wider block">
                  ✦ UNDERCOVER SABOTEUR REVEALED
                </span>
                <span className="font-bubble text-3xl font-black text-[#302044] drop-shadow-[1px_2px_0px_#FFFFFF]">
                  {saboteurPlayer ? saboteurPlayer.name : 'Unknown Infiltrator'}
                </span>
                <p className="text-xs font-bold text-[#302044]/80 mt-1">
                  {result?.saboteurSuccess
                    ? '🎉 THE SNEAKY SABOTEUR ESCAPED! Deception objective fulfilled with total victory!'
                    : '🚨 CAUGHT RED-HANDED! The Signal Agents spotted the trickster!'}
                </p>
              </div>
            </div>

            {saboteurPlayer && (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border-3 border-[#302044] shadow-[2px_3px_0px_#302044] shrink-0">
                <AvatarDisplay avatarId={saboteurPlayer.avatar} size="sm" showBorder={false} />
                <div className="text-right">
                  <span className="font-bubble text-xs font-bold text-[#302044] block">{saboteurPlayer.name}</span>
                  <span className="font-bubble text-xs font-black text-[#FF5DA2]">
                    +{result?.scoresGained[saboteurPlayer.id] || 0} PTS
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Correct Answer Box */}
      <div className="toy-card p-6 space-y-3 bg-white">
        <div className="flex items-center justify-between">
          <span className="font-bubble text-xs font-black text-[#70E6BB] bg-[#302044] px-3 py-1 rounded-full uppercase tracking-wider">
            VERIFIED CORRECT ANSWER
          </span>
          <span className="font-bubble text-xs font-bold text-emerald-700 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> Official Solution
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#E2FAF1] border-3 border-[#302044] text-emerald-950 font-bubble text-lg sm:text-xl font-black shadow-[2px_3px_0px_#302044]">
          {result?.correctAnswer}
        </div>

        {result?.explanation && (
          <p className="text-xs font-bold text-[#302044]/80 leading-relaxed bg-[#FFF8E9] p-3.5 rounded-2xl border-2 border-[#302044]">
            <strong className="text-[#302044] font-black">HOW IT WORKS: </strong>
            {result.explanation}
          </p>
        )}
      </div>

      {/* Player Score Breakdown */}
      <div className="toy-card p-6 sm:p-7 space-y-4 bg-white">
        <h3 className="font-bubble text-xl font-black text-[#302044]">
          Round Score Tally & Submissions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {players.map((p) => {
            const gain = result?.scoresGained[p.id] || 0;
            const breakdowns = result?.scoreBreakdowns[p.id] || [];
            const sub = result?.playerSubmissions.find(s => s.playerId === p.id);

            return (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-[#FFF8E9] border-3 border-[#302044] shadow-[2px_3px_0px_#302044] space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <AvatarDisplay avatarId={p.avatar} size="xs" showBorder={false} />
                    <span className="font-bubble text-sm font-bold text-[#302044]">{p.name}</span>
                  </div>
                  <span className="font-bubble font-black text-base text-[#FF5DA2]">
                    +{gain} PTS
                  </span>
                </div>

                <div className="text-[11px] font-bold text-[#302044]/80 bg-white p-2.5 rounded-xl border-2 border-[#302044] space-y-1">
                  <div>
                    <span className="text-[#302044]/50">Answer: </span>
                    <strong className="text-[#302044]">{sub?.submission ?? 'None'}</strong>
                  </div>
                  {breakdowns.length > 0 ? (
                    breakdowns.map((b, i) => (
                      <div key={i} className="flex justify-between text-[#302044]">
                        <span>✦ {b.reason}</span>
                        <span className="text-[#9B72FF] font-black">+{b.points}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 italic">No points scored this round</div>
                  )}
                </div>

                <div className="flex justify-between text-xs pt-1 border-t-2 border-[#302044]/10 font-bold">
                  <span className="text-[#302044]/60">Total Score:</span>
                  <span className="font-bubble font-black text-sm text-[#302044]">{p.score} PTS</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
