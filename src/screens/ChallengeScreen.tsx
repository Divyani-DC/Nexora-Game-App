import { useState } from 'react';
import { Check, Lock, Sparkles, HelpCircle, Users } from 'lucide-react';
import { PublicRoomState } from '../types/game.ts';
import { TimerRing } from '../components/TimerRing.tsx';
import { AvatarDisplay } from '../components/Avatars.tsx';
import { Mascot } from '../components/ChaosCrew.tsx';
import { sound } from '../services/audio.ts';

interface ChallengeScreenProps {
  roomState: PublicRoomState;
  onSubmitAnswer: (submission: string | number) => Promise<void>;
}

export function ChallengeScreen({ roomState, onSubmitAnswer }: ChallengeScreenProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const challenge = roomState.currentChallenge;
  const myPlayer = roomState.myPlayer;
  const hasSubmitted = myPlayer?.hasSubmitted ?? false;
  const mySubmission = roomState.mySubmission;

  const players = Object.values(roomState.players);
  const submittedCount = players.filter((p) => p.hasSubmitted).length;

  const handleSelect = async (opt: string) => {
    if (hasSubmitted || submitting) return;
    setSelectedOption(opt);
    setSubmitting(true);
    setError(null);
    sound.playClick();

    try {
      await onSubmitAnswer(opt);
      sound.playSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Brain Blast Arena Game Show Header Banner */}
      <div className="toy-card-yellow p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left flex items-center gap-4">
          <Mascot character="mochi" expression="excited" size="md" />
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#FF5DA2] text-white font-bubble text-xs font-black tracking-wider border-2 border-[#302044] shadow-[1px_2px_0px_#302044] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD84D]" />
              <span>
                {challenge?.categoryName?.toUpperCase() || 'CHAOS PUZZLE'} · ROUND {roomState.round}/{roomState.totalRounds}
              </span>
            </div>
            <h2 className="font-bubble text-2xl sm:text-3xl font-extrabold text-[#302044]">
              {challenge?.title || 'Rapid Challenge'}
            </h2>
            {challenge?.description && (
              <p className="text-xs font-bold text-[#756A84] mt-0.5">
                {challenge.description}
              </p>
            )}
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

      {/* Main Challenge Question Box on Pure White Card */}
      <div className="toy-card p-6 sm:p-8 space-y-6 bg-white">
        <div className="p-5 sm:p-6 rounded-3xl bg-[#FFFDF5] border-3 border-[#302044] shadow-[3px_4px_0px_#302044] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bubble text-xs font-black text-[#53CFFF] uppercase tracking-wider bg-white px-2.5 py-0.5 rounded-full border-2 border-[#302044]">
              QUESTION PROMPT
            </span>
            <HelpCircle className="w-4 h-4 text-[#302044]/40" />
          </div>
          <p className="font-bubble text-lg sm:text-2xl font-black text-[#302044] leading-snug">
            {challenge?.prompt}
          </p>
        </div>

        {/* Options Grid Styled Like Chunky Toy Buttons */}
        {challenge?.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {challenge.options.map((opt, idx) => {
              const isChosen = (hasSubmitted && mySubmission === opt) || selectedOption === opt;
              const buttonTheme =
                idx === 0
                  ? 'btn-chunky-pink'
                  : idx === 1
                  ? 'btn-chunky-yellow'
                  : idx === 2
                  ? 'btn-chunky-blue'
                  : 'btn-chunky-purple';

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  disabled={hasSubmitted || submitting}
                  className={`w-full p-4 sm:p-5 rounded-2xl text-left font-bubble text-base sm:text-lg flex items-center justify-between gap-3 transition-all cursor-pointer ${buttonTheme} ${
                    isChosen
                      ? 'ring-4 ring-[#302044] scale-[1.02] shadow-[0_6px_0_#302044]'
                      : 'opacity-90 hover:opacity-100 hover:scale-[1.01]'
                  } ${hasSubmitted && !isChosen ? 'opacity-40 grayscale-[30%]' : ''}`}
                >
                  <span className="leading-snug break-words flex-1 font-bold">
                    {opt}
                  </span>
                  {isChosen ? (
                    <span className="shrink-0 p-1.5 rounded-xl bg-white text-[#302044] shadow-sm">
                      <Check className="w-5 h-5 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="shrink-0 w-6 h-6 rounded-full border-2 border-current opacity-40" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Live Submission Progress Bar */}
        <div className="pt-4 border-t-2 border-[#EAE4F5] flex items-center justify-between text-xs font-bold text-[#756A84]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#9671FF]" />
            <span>Answers Locked:</span>
            <span className="font-bubble text-[#FF5DA2] text-sm">
              {submittedCount} of {players.length} Players
            </span>
          </div>

          {hasSubmitted && (
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300 font-bubble">
              <Lock className="w-3.5 h-3.5" /> Locked & Encrypted!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
