import { useState } from 'react';
import { X, Eye, EyeOff, Sparkles, Loader2, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { api, AuthUser } from '../services/api.ts';
import { AVATAR_OPTIONS, AvatarDisplay } from './Avatars.tsx';
import { Mascot } from './ChaosCrew.tsx';
import { sound } from '../services/audio.ts';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

export function AuthModal({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('avatar-1');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setForgotMessage(null);
    sound.playClick();

    if (mode === 'forgot') {
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      setLoading(true);
      try {
        const msg = await api.forgotPassword(email);
        setForgotMessage(msg);
        sound.playSuccess();
      } catch (err: any) {
        setError(err.message || 'Password reset request failed.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'register') {
      if (!displayName.trim()) {
        setError('Please choose a clubhouse display name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please provide a valid email.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setLoading(true);
      try {
        const user = await api.register(email, password, displayName, selectedAvatar);
        sound.playSuccess();
        onSuccess(user);
        onClose();
      } catch (err: any) {
        setError(err.message || 'Registration failed. That email may already be in use.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Login mode
    if (!email.trim() || !password) {
      setError('Please provide your email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await api.login(email, password);
      sound.playSuccess();
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#302044]/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto toy-card p-6 sm:p-8 space-y-6 text-[#302044] bg-white shadow-[0_20px_50px_rgba(48,32,68,0.15),0_8px_0_#302044]">
        {/* Close Button */}
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

        {/* Mascot & Official Badge Greeting */}
        <div className="flex items-center gap-3">
          <img
            src="/pwa-192x192.png"
            alt="NEXORA"
            className="w-12 h-12 rounded-2xl border-2 border-[#302044] shadow-[2px_2px_0px_#302044] object-cover shrink-0"
          />
          <Mascot
            character={mode === 'register' ? 'boom' : mode === 'forgot' ? 'pickle' : 'pip'}
            expression={error ? 'shocked' : 'excited'}
            size="md"
            animate={true}
          />
          <div>
            <span className="font-bubble text-xs text-[#FF5DA2] font-black uppercase tracking-wider block">
              {mode === 'login' ? 'CLUBHOUSE ACCESS' : mode === 'register' ? 'JOIN THE GANG' : 'PASSWORD RESCUE'}
            </span>
            <h2 className="font-bubble text-2xl sm:text-3xl font-black text-[#302044]">
              {mode === 'login' ? 'WELCOME BACK!' : mode === 'register' ? 'JOIN THE CHAOS CLUB!' : 'RESET PASSWORD'}
            </h2>
            <p className="text-xs font-bold text-[#756A84]">
              {mode === 'login'
                ? 'Your chaos crew missed you.'
                : mode === 'register'
                ? 'Create your account and get ready for chaos.'
                : "We'll send you a rescue link."}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs font-bold">
            {error}
          </div>
        )}

        {forgotMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{forgotMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Registration Fields */}
          {mode === 'register' && (
            <>
              <div>
                <label className="block font-bubble text-xs font-bold text-[#302044] mb-1.5 uppercase tracking-wide">
                  YOUR CLUB DISPLAY NAME
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#756A84] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Mischief Maker"
                    maxLength={16}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FFFDF7] border-2 border-[#302044] focus:border-[#FF5DA2] focus:outline-none text-[#302044] font-bold text-sm shadow-[2px_2px_0px_#302044]"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block font-bubble text-xs font-bold text-[#302044] mb-1.5 uppercase tracking-wide">
                  CHOOSE YOUR CHAOS MASCOT
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
                      className={`flex flex-col items-center gap-1 p-1.5 rounded-2xl border-2 transition-all cursor-pointer ${
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
            </>
          )}

          {/* Email */}
          <div>
            <label className="block font-bubble text-xs font-bold text-[#302044] mb-1.5 uppercase tracking-wide">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#756A84] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@chaosclub.fun"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FFFDF7] border-2 border-[#302044] focus:border-[#FF5DA2] focus:outline-none text-[#302044] font-bold text-sm shadow-[2px_2px_0px_#302044]"
              />
            </div>
          </div>

          {/* Password (if not in forgot mode) */}
          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bubble text-xs font-bold text-[#302044] uppercase tracking-wide">
                  PASSWORD
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setMode('forgot');
                    }}
                    className="text-[11px] font-bubble font-bold text-[#9671FF] hover:text-[#7A4EE0] cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#756A84] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-2xl bg-[#FFFDF7] border-2 border-[#302044] focus:border-[#FF5DA2] focus:outline-none text-[#302044] font-bold text-sm shadow-[2px_2px_0px_#302044]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#756A84] hover:text-[#302044] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password (register mode) */}
          {mode === 'register' && (
            <div>
              <label className="block font-bubble text-xs font-bold text-[#302044] mb-1.5 uppercase tracking-wide">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#756A84] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FFFDF7] border-2 border-[#302044] focus:border-[#FF5DA2] focus:outline-none text-[#302044] font-bold text-sm shadow-[2px_2px_0px_#302044]"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-chunky btn-chunky-pink py-3.5 text-base flex items-center justify-center gap-2 mt-4 shadow-[0_4px_0_#B81F6C,0_6px_0_#302044]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>CONNECTING...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#FFD84D]" />
                <span>
                  {mode === 'login'
                    ? 'SIGN IN TO CLUBHOUSE'
                    : mode === 'register'
                    ? 'CREATE MY ACCOUNT! ✦'
                    : 'SEND RESET LINK'}
                </span>
              </>
            )}
          </button>
        </form>

        {/* Mode Toggle Footer */}
        <div className="pt-3 border-t-2 border-[#EAE4F5] text-center text-xs font-bold text-[#756A84]">
          {mode === 'login' ? (
            <p>
              New to the Chaos Club?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('register');
                }}
                className="text-[#FF5DA2] hover:text-[#FF39A8] font-bubble font-black underline cursor-pointer ml-1"
              >
                Sign Up Free
              </button>
            </p>
          ) : mode === 'register' ? (
            <p>
              Already a Clubhouse member?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('login');
                }}
                className="text-[#53CFFF] hover:text-[#28A5D6] font-bubble font-black underline cursor-pointer ml-1"
              >
                Log In Here
              </button>
            </p>
          ) : (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode('login');
              }}
              className="text-[#9671FF] hover:text-[#7A4EE0] font-bubble font-black underline cursor-pointer"
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
