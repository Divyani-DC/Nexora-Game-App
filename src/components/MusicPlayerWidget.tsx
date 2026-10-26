import { useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';
import { music } from '../services/musicEngine.ts';
import { sound } from '../services/audio.ts';

export function MusicPlayerWidget({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState(music.getState());
  const [showSlider, setShowSlider] = useState(false);

  useEffect(() => {
    const unsub = music.subscribe(s => setState(s));
    return unsub;
  }, []);

  const handleToggle = () => {
    sound.playClick();
    music.togglePlay();
  };

  const handleMute = () => {
    sound.playClick();
    music.toggleMute();
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    music.setVolume(parseFloat(e.target.value));
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-white border-2 border-[#302044] rounded-full px-2.5 py-1 text-xs text-[#302044] shadow-[2px_2px_0px_#302044]">
        <button
          onClick={handleToggle}
          className="p-1 rounded-full bg-[#FF5DA2] hover:bg-[#FF39A8] text-white transition-all cursor-pointer shadow-sm"
          title={state.isPlaying ? 'Pause Theme Music' : 'Play Chaos Club Theme'}
        >
          {state.isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
        </button>

        <span className="font-bubble text-[11px] font-bold text-[#302044] hidden sm:inline truncate max-w-[120px]">
          {state.isPlaying ? '♫ CHAOS THEME' : 'MUSIC OFF'}
        </span>

        {/* Animated mini EQ bars */}
        {state.isPlaying && !state.isMuted && (
          <div className="flex items-end gap-0.5 h-3 px-1">
            <span className="w-0.5 bg-[#FF5DA2] rounded-full animate-bounce-gentle h-full" />
            <span className="w-0.5 bg-[#FFD84D] rounded-full animate-bounce-gentle h-2/3" style={{ animationDelay: '0.15s' }} />
            <span className="w-0.5 bg-[#53CFFF] rounded-full animate-bounce-gentle h-4/5" style={{ animationDelay: '0.3s' }} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="toy-card-clean p-5 rounded-3xl bg-white border-3 border-[#302044] shadow-[4px_6px_0px_#302044] text-[#302044] flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <button
          onClick={handleToggle}
          className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5DA2] to-[#FF39A8] border-2 border-[#302044] shadow-[0_3px_0_#B81F6C,0_5px_0_#302044] flex items-center justify-center text-white hover:scale-105 active:translate-y-1 transition-all cursor-pointer shrink-0"
          title={state.isPlaying ? 'Pause' : 'Play Music'}
        >
          {state.isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </button>

        <div>
          <div className="flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-[#9671FF]" />
            <span className="font-bubble text-xs font-black tracking-wider text-[#FF5DA2] uppercase">
              {state.isPlaying ? 'NOW PLAYING · 128 BPM' : 'THEME MUSIC'}
            </span>
          </div>
          <div className="font-bubble text-base sm:text-lg font-black text-[#302044] leading-tight">
            NEXORA — CHAOS CLUB THEME
          </div>
          <div className="text-[11px] font-bold text-[#756A84]">
            FEEL THE CHAOS. · Original Arcade Soundtrack
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {/* Animated Equalizer bars */}
        {state.isPlaying && !state.isMuted && (
          <div className="flex items-end gap-1 h-5 px-2 bg-[#FFF8E9] rounded-lg border border-[#EAE4F5]">
            <span className="w-1 bg-[#FF5DA2] rounded-full animate-pulse h-full" />
            <span className="w-1 bg-[#FFD84D] rounded-full animate-pulse h-3/4" style={{ animationDelay: '0.1s' }} />
            <span className="w-1 bg-[#53CFFF] rounded-full animate-pulse h-1/2" style={{ animationDelay: '0.2s' }} />
            <span className="w-1 bg-[#65DDB0] rounded-full animate-pulse h-4/5" style={{ animationDelay: '0.3s' }} />
          </div>
        )}

        <button
          onClick={handleMute}
          className="p-2 rounded-xl bg-[#F8FBFF] hover:bg-[#EAF8FF] border-2 border-[#302044] text-[#302044] transition-colors cursor-pointer shadow-[2px_2px_0px_#302044]"
          title={state.isMuted ? 'Unmute' : 'Mute'}
        >
          {state.isMuted ? (
            <VolumeX className="w-4 h-4 text-slate-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#9671FF]" />
          )}
        </button>

        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={state.isMuted ? 0 : state.volume}
            onChange={handleVolume}
            className="w-20 sm:w-28 h-2 bg-[#EAE4F5] rounded-lg appearance-none cursor-pointer accent-[#FF5DA2]"
            title={`Volume: ${Math.round(state.volume * 100)}%`}
          />
        </div>
      </div>
    </div>
  );
}
