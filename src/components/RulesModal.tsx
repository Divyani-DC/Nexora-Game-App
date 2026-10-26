import { X, Award, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { Mascot } from './ChaosCrew.tsx';
import { sound } from '../services/audio.ts';

export function RulesModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto toy-card p-6 sm:p-8 space-y-6 text-[#302044]">
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
          <Mascot character="boom" expression="celebrating" size="md" animate={true} />
          <div>
            <span className="font-bubble text-xs text-[#9B72FF] font-black uppercase tracking-wider block">
              OFFICIAL POINT SCALE
            </span>
            <h2 className="font-bubble text-2xl sm:text-3xl font-extrabold text-[#302044]">
              Clubhouse Scoring
            </h2>
            <p className="text-xs font-bold text-[#302044]/70">
              Fair, server-verified scoring rules for all players
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs font-bold text-[#302044]">
          {/* Signal Agents */}
          <div className="p-4 rounded-2xl bg-[#E2FAF1] border-3 border-[#302044] shadow-[2px_3px_0px_#302044]">
            <h3 className="font-bubble text-[#302044] text-sm mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Signal Agents Scoring
            </h3>
            <ul className="space-y-2">
              <li className="flex justify-between items-center py-1 border-b-2 border-[#302044]/10">
                <span>Accurate challenge solution</span>
                <span className="font-bubble text-sm font-black text-emerald-700">+100 PTS</span>
              </li>
              <li className="flex justify-between items-center py-1 border-b-2 border-[#302044]/10">
                <span>Correct Saboteur suspicion vote</span>
                <span className="font-bubble text-sm font-black text-[#FF5DA2]">+150 PTS</span>
              </li>
              <li className="flex justify-between items-center py-1 border-b-2 border-[#302044]/10">
                <span>Consensus alignment / prediction</span>
                <span className="font-bubble text-sm font-black text-[#9B72FF]">+50 PTS</span>
              </li>
            </ul>
          </div>

          {/* Saboteur */}
          <div className="p-4 rounded-2xl bg-[#FFE6F1] border-3 border-[#302044] shadow-[2px_3px_0px_#302044]">
            <h3 className="font-bubble text-[#FF5DA2] text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FF5DA2]" /> Saboteur Scoring
            </h3>
            <ul className="space-y-2">
              <li className="flex justify-between items-center py-1 border-b-2 border-[#302044]/10">
                <span>Fulfill secret deception without being caught</span>
                <span className="font-bubble text-sm font-black text-[#FF5DA2]">+150 PTS</span>
              </li>
              <li className="flex justify-between items-center py-1 border-b-2 border-[#302044]/10">
                <span>Mislead the majority on challenge answer</span>
                <span className="font-bubble text-sm font-black text-emerald-700">+100 PTS</span>
              </li>
            </ul>
          </div>

          {/* Duel Mode */}
          <div className="p-4 rounded-2xl bg-[#FFF0B8] border-3 border-[#302044] shadow-[2px_3px_0px_#302044]">
            <h3 className="font-bubble text-[#302044] text-sm mb-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#53CFFF]" /> 2-Player Duel Match Scoring
            </h3>
            <p className="text-[#302044]/80 leading-relaxed font-normal">
              In 2-player matches, players earn +100 for correct puzzle solutions and +50 for out-predicting their opponent's choice.
            </p>
          </div>

          {/* Tiebreaker */}
          <div className="p-3.5 rounded-2xl bg-white border-2 border-[#302044] text-[#302044]/70">
            <strong className="text-[#302044]">Tiebreaker Rule:</strong> Cumulative points determine the winner. If players tie, highest challenge puzzle points breaks the tie. If still equal, a joint championship is celebrated!
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full btn-chunky btn-chunky-yellow py-3 text-sm"
          >
            CLOSE HANDBOOK
          </button>
        </div>
      </div>
    </div>
  );
}
