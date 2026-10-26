import { useState } from 'react';
import { Eye, Check, Lock, Users, Sparkles } from 'lucide-react';
import { PublicRoomState } from '../types/game.ts';
import { TimerRing } from '../components/TimerRing.tsx';
import { AvatarDisplay } from '../components/Avatars.tsx';
import { Mascot } from '../components/ChaosCrew.tsx';
import { sound } from '../services/audio.ts';

interface InvestigationScreenProps {
  roomState: PublicRoomState;
  onSubmitVote: (targetPlayerId: string) => Promise<void>;
}

export function InvestigationScreen({ roomState, onSubmitVote }: InvestigationScreenProps) {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const myPlayer = roomState.myPlayer;
  const hasVoted = myPlayer?.hasVoted ?? false;
  const myVote = roomState.myVote;

  const players = Object.values(roomState.players);
  const isDuel = roomState.isDuelMode;
  const votedCount = players.filter((p) => p.hasVoted).length;

  const eligibleTargets = players.filter((p) => p.id !== myPlayer?.id);

  const handleVote = async (targetId: string) => {
    if (hasVoted || voting) return;
    setSelectedTarget(targetId);
    setVoting(true);
    setError(null);
    sound.playClick();

    try {
      await onSubmitVote(targetId);
      sound.playSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit suspicion vote.');
      setVoting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Cartoon Mystery Detective Header on Clean White / Soft Purple Garden */}
      <div className="toy-card-purple p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <Mascot character="pickle" expression="suspicious" size="md" animate={true} />
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FF5DA2] text-white font-bubble text-xs font-black tracking-wider border-2 border-[#302044] shadow-[1px_2px_0px_#302044] mb-1">
              <Eye className="w-3.5 h-3.5" />
              <span>MYSTERY GARDEN · WHO'S ACTING SUS?</span>
            </div>
            <h2 className="font-bubble text-3xl sm:text-4xl font-black text-[#302044]">
              {isDuel ? 'Tactical Counter-Move' : 'Unmask the Saboteur!'}
            </h2>
            <p className="text-xs font-bold text-[#756A84] mt-0.5">
              {isDuel
                ? 'Predict your rival’s secret choice for bonus victory points!'
                : 'Someone is definitely lying through their teeth. Pick your suspect!'}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <TimerRing timerEndsAt={roomState.timerEndsAt} totalDuration={roomState.timerTotalDuration} size={68} />
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-100 border-2 border-rose-400 text-rose-800 text-xs font-bold text-center">
          {error}
        </div>
      )}

      {/* Suspect Target Cards on Bright White Background */}
      <div className="toy-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <span className="font-bubble text-xs font-black text-[#FF5DA2] tracking-wider uppercase">
            {isDuel ? 'SELECT YOUR RIVAL' : 'TAP TO VOTE MOST SUSPICIOUS PLAYER'}
          </span>
          <span className="font-bubble text-xs font-bold text-[#756A84]">
            {hasVoted ? '✦ Vote Encrypted' : 'Choose carefully, detective!'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {eligibleTargets.map((p) => {
            const isVotedTarget = (hasVoted && myVote === p.id) || selectedTarget === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleVote(p.id)}
                disabled={hasVoted || voting}
                className={`p-4 rounded-2xl text-left transition-all flex items-center justify-between gap-3 border-3 border-[#302044] cursor-pointer ${
                  isVotedTarget
                    ? 'bg-[#FF5DA2] text-white shadow-[0_4px_0_#B81F6C,0_6px_0_#302044] scale-[1.02] ring-3 ring-[#FFD84D]'
                    : 'bg-white text-[#302044] hover:bg-[#FFF9E8] shadow-[3px_4px_0px_#302044]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <AvatarDisplay avatarId={p.avatar} size="sm" showBorder={false} />
                  <div className="min-w-0">
                    <span className="font-bubble text-base font-bold truncate block">
                      {p.name}
                    </span>
                    <span
                      className={`text-[11px] font-bold block ${
                        isVotedTarget ? 'text-white/80' : 'text-[#756A84]'
                      }`}
                    >
                      {p.isHost ? 'Host' : 'Suspect'} · Score: {p.score} pts
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {isVotedTarget ? (
                    <span className="p-2 rounded-xl bg-white text-[#FF5DA2] flex items-center gap-1 font-bubble text-xs font-bold">
                      <Check className="w-4 h-4" /> Voted!
                    </span>
                  ) : (
                    <span className="p-2 rounded-xl bg-[#F8FBFF] text-[#756A84] border border-[#EAE4F5] font-bubble text-xs">
                      Vote Sus
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Voting Progress Status */}
        <div className="pt-4 border-t-2 border-[#EAE4F5] flex items-center justify-between text-xs font-bold text-[#756A84]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#9671FF]" />
            <span>Votes Sealed:</span>
            <span className="font-bubble text-[#FF5DA2] text-sm">
              {votedCount} of {players.length} Players
            </span>
          </div>

          {hasVoted && (
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300 font-bubble">
              <Lock className="w-3.5 h-3.5" /> Suspect Choice Locked
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
