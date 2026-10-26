import { X, ShieldAlert, Cpu, Zap, HelpCircle, Sparkles } from 'lucide-react';
import { Mascot } from './ChaosCrew.tsx';
import { sound } from '../services/audio.ts';

export function HowToPlayModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto toy-card p-6 sm:p-8 space-y-6 text-[#302044]">
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-[#FFF8E9] hover:bg-[#FFE6F1] border-2 border-[#302044] text-[#302044] shadow-[2px_2px_0px_#302044] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4">
          <Mascot character="pip" expression="excited" size="md" animate={true} />
          <div>
            <span className="font-bubble text-xs text-[#FF5DA2] font-black uppercase tracking-wider block">
              CHAOS CLUB HANDBOOK
            </span>
            <h2 className="font-bubble text-2xl sm:text-3xl font-extrabold text-[#302044]">
              How to Play & Win!
            </h2>
            <p className="text-xs font-bold text-[#302044]/70">
              Master the 5-round battle of logic, bluffing, and cartoon deduction
            </p>
          </div>
        </div>

        <div className="space-y-5 text-sm">
          {/* Overview */}
          <div className="p-4 rounded-2xl bg-[#FFF0B8] border-3 border-[#302044] shadow-[3px_3px_0px_#302044]">
            <h3 className="font-bubble font-bold text-[#302044] text-base mb-1 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FF8A3D]" /> The Goal
            </h3>
            <p className="text-xs font-bold text-[#302044]/80 leading-relaxed">
              2 to 8 players face off across 5 ridiculous, rapid-fire rounds. Score points by solving puzzles, outsmarting rivals, and unmasking or pulling off sneaky sabotage!
            </p>
          </div>

          {/* Roles */}
          <div>
            <h3 className="font-bubble font-bold text-[#302044] text-base mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#FF5DA2]" /> Secret Roles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-[#E2FAF1] border-2 border-[#302044]">
                <div className="flex items-center gap-2 mb-1">
                  <Mascot character="mochi" size="xs" />
                  <span className="font-bubble font-bold text-[#70E6BB] text-sm text-[#302044]">Signal Agents</span>
                </div>
                <p className="text-xs font-semibold text-[#302044]/70 leading-relaxed">
                  Solve the challenge accurately before the timer ends. In Phase D, examine clues and vote for the player acting most suspicious!
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFE6F1] border-2 border-[#302044]">
                <div className="flex items-center gap-2 mb-1">
                  <Mascot character="pickle" size="xs" />
                  <span className="font-bubble font-bold text-[#FF5DA2] text-sm">The Saboteur</span>
                </div>
                <p className="text-xs font-semibold text-[#302044]/70 leading-relaxed">
                  Blend into the crew. Your secret goal is to subtly guide the room into picking wrong answers without getting caught!
                </p>
              </div>
            </div>
            <div className="mt-3 p-3 rounded-2xl bg-[#EFE9FF] border-2 border-[#302044] text-xs font-bold text-[#302044]">
              <strong className="text-[#9B72FF]">2-Player Duel Mode:</strong> When exactly two players compete, the match activates Duel Mode! Both players face head-to-head asymmetric challenges and direct prediction duels.
            </div>
          </div>

          {/* Phases */}
          <div>
            <h3 className="font-bubble font-bold text-[#302044] text-base mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#53CFFF]" /> 5 Game Phases Each Round
            </h3>
            <ol className="space-y-2 text-xs font-bold text-[#302044]">
              <li className="p-3 rounded-2xl bg-[#FFF8E9] border-2 border-[#302044] flex gap-3 items-center">
                <span className="font-bubble text-[#FF5DA2] text-sm shrink-0">1. Briefing</span>
                <span className="text-[#302044]/80">Read your top-secret role and confidential mission directive.</span>
              </li>
              <li className="p-3 rounded-2xl bg-[#FFF8E9] border-2 border-[#302044] flex gap-3 items-center">
                <span className="font-bubble text-[#53CFFF] text-sm shrink-0">2. Challenge</span>
                <span className="text-[#302044]/80">Lock in your answer to logic ciphers or consensus matrices.</span>
              </li>
              <li className="p-3 rounded-2xl bg-[#FFF8E9] border-2 border-[#302044] flex gap-3 items-center">
                <span className="font-bubble text-[#9B72FF] text-sm shrink-0">3. Investigation</span>
                <span className="text-[#302044]/80">Inspect clues and vote on who is acting suspicious!</span>
              </li>
              <li className="p-3 rounded-2xl bg-[#FFF8E9] border-2 border-[#302044] flex gap-3 items-center">
                <span className="font-bubble text-[#70E6BB] text-sm shrink-0">4. Reveal</span>
                <span className="text-[#302044]/80">The truth comes out! Saboteurs exposed and points awarded.</span>
              </li>
              <li className="p-3 rounded-2xl bg-[#FFF8E9] border-2 border-[#302044] flex gap-3 items-center">
                <span className="font-bubble text-[#FF8A3D] text-sm shrink-0">5. Podium</span>
                <span className="text-[#302044]/80">After round 5, celebrate the ultimate Champion!</span>
              </li>
            </ol>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full btn-chunky btn-chunky-pink py-3.5 text-base"
          >
            GOT IT, LET'S PLAY! ✦
          </button>
        </div>
      </div>
    </div>
  );
}
