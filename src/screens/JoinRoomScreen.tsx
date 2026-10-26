import { useState } from 'react';
import { ArrowLeft, KeyRound, Loader2, Sparkles, Clipboard } from 'lucide-react';
import { AVATAR_OPTIONS, AvatarDisplay } from '../components/Avatars.tsx';
import { Mascot } from '../components/ChaosCrew.tsx';
import { sound } from '../services/audio.ts';

import { AuthUser } from '../services/api.ts';

interface JoinRoomScreenProps {
  currentUser?: AuthUser | null;
  initialCode?: string;
  onBack: () => void;
  onSubmit: (code: string, name: string, avatar: string) => Promise<void>;
}

export function JoinRoomScreen({
  currentUser,
  initialCode = '',
  onBack,
  onSubmit
}: JoinRoomScreenProps) {
  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState(currentUser?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || 'avatar-2');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Whoops! You need a room code to open this clubhouse.");
      return;
    }

    setError(null);
    setLoading(true);
    sound.playClick();

    try {
      await onSubmit(code.trim().toUpperCase(), name.trim() || 'Wild Recruit', selectedAvatar);
    } catch (err: any) {
      setError(err.message || "Whoops! That code doesn't open this clubhouse. Double check with your host!");
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setCode(text.trim().toUpperCase());
        sound.playClick();
      }
    } catch {
      // ignore clipboard error
    }
  };

  const hasCode = code.trim().length > 0;

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg toy-card p-6 sm:p-8 space-y-6">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="flex items-center gap-2 text-xs font-bubble font-bold text-[#302044]/70 hover:text-[#53CFFF] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Playground
        </button>

        <div className="flex items-center gap-4">
          <Mascot
            character="zap"
            expression={error ? 'shocked' : hasCode ? 'excited' : 'happy'}
            size="md"
            animate={hasCode}
          />
          <div>
            <span className="font-bubble text-xs text-[#53CFFF] font-bold uppercase tracking-wider block">
              WHERE'S THE PARTY?
            </span>
            <h2 className="font-bubble text-2xl sm:text-3xl font-extrabold text-[#302044]">
              Join Arena
            </h2>
            <p className="text-xs font-semibold text-[#302044]/70">
              Got a code? You're one tiny step away from chaos!
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-100 border-2 border-rose-400 text-rose-800 text-xs font-bold flex items-center gap-2">
            <Mascot character="pickle" expression="suspicious" size="xs" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Code with Paste button */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bubble text-xs font-bold text-[#302044] tracking-wide uppercase">
                TICKET ROOM CODE
              </label>
              <button
                type="button"
                onClick={handlePaste}
                className="text-[11px] font-bubble font-bold text-[#53CFFF] hover:text-[#28A5D6] flex items-center gap-1 cursor-pointer"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Paste Code</span>
              </button>
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. NX-4821"
              maxLength={8}
              className="w-full px-4 py-3.5 rounded-2xl bg-[#FFF0B8] border-3 border-[#302044] focus:border-[#53CFFF] focus:outline-none text-[#302044] font-mono-tabular tracking-widest text-center text-xl font-black placeholder:text-[#302044]/30 shadow-[3px_4px_0px_#302044] transition-all"
              autoFocus
            />
          </div>

          {/* Player Name */}
          <div>
            <label className="block font-bubble text-xs font-bold text-[#302044] mb-2 tracking-wide uppercase">
              YOUR PLAYER NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sneaky Pickle"
              maxLength={16}
              className="w-full px-4 py-3.5 rounded-2xl bg-[#FFF8E9] border-3 border-[#302044] focus:border-[#53CFFF] focus:outline-none text-[#302044] font-bold text-sm placeholder:text-[#302044]/40 shadow-[2px_3px_0px_#302044] transition-all"
            />
          </div>

          {/* Avatar Picker */}
          <div>
            <label className="block font-bubble text-xs font-bold text-[#302044] mb-2 tracking-wide uppercase">
              SELECT YOUR CHAOS MASCOT
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {AVATAR_OPTIONS.map((opt) => {
                const isSelected = selectedAvatar === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedAvatar(opt.id);
                    }}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#53CFFF] border-[#302044] scale-105 shadow-[3px_4px_0px_#302044]'
                        : 'bg-white hover:bg-[#FFF8E9] border-[#302044]/40 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <AvatarDisplay avatarId={opt.id} size="sm" showBorder={false} />
                    <span className="font-bubble text-[11px] font-bold text-[#302044] truncate w-full text-center">
                      {opt.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-chunky btn-chunky-blue py-4 text-base flex items-center justify-center gap-2 shadow-[0_5px_0_#28A5D6,0_7px_0_#302044]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>KNOCKING ON CLUBHOUSE...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-5 h-5 text-[#302044]" />
                <span>ENTER THE CLUBHOUSE! ✦</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
