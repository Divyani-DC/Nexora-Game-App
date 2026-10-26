import { useState } from 'react';
import { X, Trophy, LogOut, Check, Sparkles, User, Mail, Calendar } from 'lucide-react';
import { api, AuthUser } from '../services/api.ts';
import { AVATAR_OPTIONS, AvatarDisplay } from './Avatars.tsx';
import { sound } from '../services/audio.ts';

interface ProfileModalProps {
  isOpen: boolean;
  user: AuthUser;
  onClose: () => void;
  onUpdate: (updated: AuthUser) => void;
  onLogout: () => void;
}

export function ProfileModal({
  isOpen,
  user,
  onClose,
  onUpdate,
  onLogout
}: ProfileModalProps) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || 'avatar-1');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Display name cannot be empty');
      return;
    }
    setSaving(true);
    setError(null);
    sound.playClick();

    try {
      const updated = await api.updateProfile(displayName.trim(), selectedAvatar);
      onUpdate(updated);
      setSaved(true);
      sound.playSuccess();
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const winRate = user.gamesPlayed > 0 ? Math.round((user.gamesWon / user.gamesPlayed) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#302044]/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto toy-card p-6 sm:p-8 space-y-6 text-[#302044] bg-white shadow-[0_20px_50px_rgba(48,32,68,0.15),0_8px_0_#302044]">
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-[#FFF8E9] hover:bg-[#FFE6F1] border-2 border-[#302044] text-[#302044] transition-all cursor-pointer shadow-sm"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Passport Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#FFF3D4] rounded-2xl border-2 border-[#302044] shadow-sm">
            <AvatarDisplay avatarId={selectedAvatar} size="md" showBorder={false} />
          </div>
          <div>
            <span className="font-bubble text-xs text-[#FF5DA2] font-black uppercase tracking-wider block">
              OFFICIAL PASSPORT
            </span>
            <h2 className="font-bubble text-2xl sm:text-3xl font-black text-[#302044]">
              Clubhouse Passport
            </h2>
            <p className="text-xs font-bold text-[#756A84] flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" /> {user.email}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs font-bold">
            {error}
          </div>
        )}

        {/* Real Stats Box on White & Pastels */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#FFFDF5] border-2 border-[#EAE4F5] text-center shadow-sm">
            <span className="text-[10px] font-bubble font-bold text-[#756A84] uppercase block">Played</span>
            <span className="font-bubble text-2xl font-black text-[#302044]">{user.gamesPlayed}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FFFDF5] border-2 border-[#EAE4F5] text-center shadow-sm">
            <span className="text-[10px] font-bubble font-bold text-[#756A84] uppercase block">Victories</span>
            <span className="font-bubble text-2xl font-black text-[#FF5DA2]">{user.gamesWon}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FFFDF5] border-2 border-[#EAE4F5] text-center shadow-sm">
            <span className="text-[10px] font-bubble font-bold text-[#756A84] uppercase block">Win Rate</span>
            <span className="font-bubble text-2xl font-black text-[#65DDB0]">{winRate}%</span>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block font-bubble text-xs font-bold text-[#302044] mb-1.5 uppercase tracking-wide">
              DISPLAY NAME
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={16}
              required
              className="w-full px-4 py-3 rounded-2xl bg-[#FFFDF7] border-2 border-[#302044] focus:border-[#FF5DA2] focus:outline-none text-[#302044] font-bold text-sm shadow-[2px_2px_0px_#302044]"
            />
          </div>

          <div>
            <label className="block font-bubble text-xs font-bold text-[#302044] mb-1.5 uppercase tracking-wide">
              CHANGE YOUR CHAOS MASCOT
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSelectedAvatar(opt.id);
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedAvatar === opt.id
                      ? 'bg-[#FFD84D] border-[#302044] scale-105 shadow-[2px_3px_0px_#302044]'
                      : 'bg-[#FFFDF7] border-[#302044]/30 hover:bg-[#FFF8E9]'
                  }`}
                >
                  <AvatarDisplay avatarId={opt.id} size="xs" showBorder={false} />
                  <span className="font-bubble text-[10px] font-bold text-[#302044] truncate w-full text-center">
                    {opt.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-chunky btn-chunky-pink py-3 text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_#B81F6C,0_6px_0_#302044]"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>SAVED! ✦</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#FFD84D]" />
                  <span>{saving ? 'SAVING...' : 'SAVE CHANGES'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onLogout();
              }}
              className="btn-chunky btn-chunky-white py-3 px-4 text-xs text-rose-600 flex items-center gap-1.5 shadow-[0_4px_0_#E2DBF0,0_6px_0_#302044]"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
