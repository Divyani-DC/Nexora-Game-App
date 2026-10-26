import { useEffect } from 'react';
import { Trophy, Crown, RotateCcw, Home, Sparkles, Award } from 'lucide-react';
import { PublicRoomState } from '../types/game.ts';
import { AvatarDisplay } from '../components/Avatars.tsx';
import { Mascot } from '../components/ChaosCrew.tsx';
import { Confetti } from '../components/Confetti.tsx';
import { sound } from '../services/audio.ts';

interface FinalResultsScreenProps {
  roomState: PublicRoomState;
  onRematch: () => Promise<void>;
  onHome: () => void;
}

export function FinalResultsScreen({ roomState, onRematch, onHome }: FinalResultsScreenProps) {
  const isHost = roomState.myPlayer?.isHost ?? false;

  useEffect(() => {
    sound.playVictory();
  }, []);

  const sortedPlayers = Object.values(roomState.players).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.challengePoints - a.challengePoints;
  });

  const winners = sortedPlayers.filter((p) => roomState.winnerIds.includes(p.id));
  const primaryWinner = winners[0] || sortedPlayers[0];

  return (
    <div className="relative max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Real Confetti Explosion on Victory */}
      <Confetti durationMs={7000} />

      {/* Podium Header on White Celebration Theme */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD84D] border-3 border-[#302044] text-[#302044] text-xs font-bubble font-black tracking-wider shadow-[2px_3px_0px_#302044] -rotate-1">
          <Sparkles className="w-4 h-4 text-[#FF5DA2]" />
          <span>VICTORY WONDERLAND · 5 ROUNDS OF COMPLETE CHAOS</span>
        </div>
        <h1 className="font-bubble text-5xl sm:text-7xl font-black text-[#302044] tracking-tight">
          ABSOLUTE LEGEND! ✦
        </h1>
        <p className="text-sm font-bold text-[#756A84] max-w-md mx-auto">
          {roomState.tiebreakUsed
            ? 'Score tie broken! Awarded by verified challenge puzzle accuracy.'
            : 'All 5 rounds officially verified by the Chaos Clubhouse engine!'}
        </p>
      </div>

      {/* Winner Spotlight Podium */}
      {primaryWinner && (
        <div className="toy-card-yellow p-8 sm:p-12 text-center relative overflow-hidden space-y-6">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#FF5DA2] text-white border-2 border-[#302044] font-bubble text-xs font-black tracking-wider shadow-[2px_2px_0px_#302044] -rotate-2">
            <Crown className="w-4 h-4 text-[#FFD84D]" />
            <span>CHAOS CHAMPION</span>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <AvatarDisplay avatarId={primaryWinner.avatar} size="xl" showBorder={true} />
              <div className="absolute -bottom-3 -right-3 p-3 bg-[#FFD84D] text-[#302044] rounded-2xl border-3 border-[#302044] shadow-[2px_3px_0px_#302044]">
                <Trophy className="w-6 h-6 fill-current" />
              </div>
            </div>

            <div>
              <h2 className="font-bubble text-3xl sm:text-5xl font-black text-[#302044]">
                {primaryWinner.name}
              </h2>
              <span className="font-bubble text-xs font-bold text-[#756A84] uppercase tracking-widest block mt-1">
                TOTAL ACCUMULATED POINTS
              </span>
              <div className="font-bubble text-5xl sm:text-6xl font-black text-[#FF5DA2] drop-shadow-[2px_3px_0px_#FFE5F1] mt-2">
                {primaryWinner.score} <span className="text-xl text-[#302044] font-bold">PTS</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Leaderboard on Pure White Toy Card */}
      <div className="toy-card p-6 sm:p-8 space-y-4 bg-white">
        <h3 className="font-bubble text-xl font-black text-[#302044] flex items-center gap-2">
          <Award className="w-5 h-5 text-[#9671FF]" /> Final Clubhouse Standings
        </h3>

        <div className="space-y-3">
          {sortedPlayers.map((p, idx) => {
            const isWinner = roomState.winnerIds.includes(p.id);
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-4 rounded-2xl border-3 border-[#302044] transition-transform ${
                  isWinner
                    ? 'bg-[#FFF3CC] shadow-[3px_4px_0px_#302044] scale-[1.01]'
                    : 'bg-white shadow-[2px_2px_0px_#302044]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="font-bubble text-lg font-black text-[#302044] w-6 text-center">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </span>
                  <AvatarDisplay avatarId={p.avatar} size="sm" showBorder={false} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bubble text-base font-bold text-[#302044]">
                        {p.name}
                      </span>
                      {isWinner && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FF5DA2] text-white text-[10px] font-bubble font-black">
                          WINNER
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-[#756A84]">
                      Challenge Points: {p.challengePoints} · Prediction/Role: {p.score - p.challengePoints}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bubble text-xl font-black text-[#FF5DA2]">
                    {p.score}
                  </span>
                  <span className="text-xs font-bold text-[#302044] ml-1">PTS</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          {isHost && (
            <button
              onClick={() => {
                sound.playClick();
                onRematch();
              }}
              className="w-full sm:w-auto btn-chunky btn-chunky-pink px-8 py-3.5 text-base flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5 text-white" />
              <span>PLAY AGAIN WITH CREW</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onHome();
            }}
            className="w-full sm:w-auto btn-chunky btn-chunky-white px-8 py-3.5 text-base flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5 text-[#302044]" />
            <span>RETURN TO PLAYGROUND</span>
          </button>
        </div>
      </div>
    </div>
  );
}
