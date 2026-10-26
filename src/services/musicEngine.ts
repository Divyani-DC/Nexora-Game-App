// High-energy procedural Cartoon Arcade background music engine using Web Audio API
class MusicEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private volume: number = 0.4;
  private masterGain: GainNode | null = null;
  private loopTimeout: NodeJS.Timeout | null = null;
  private currentStep: number = 0;
  private listeners: Set<(state: { isPlaying: boolean; isMuted: boolean; volume: number; step: number }) => void> = new Set();

  constructor() {
    this.isMuted = localStorage.getItem('nexora_music_muted') === 'true';
    const savedVol = localStorage.getItem('nexora_music_volume');
    if (savedVol) {
      this.volume = Math.max(0, Math.min(1, parseFloat(savedVol)));
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public subscribe(cb: (state: { isPlaying: boolean; isMuted: boolean; volume: number; step: number }) => void) {
    this.listeners.add(cb);
    cb(this.getState());
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    const s = this.getState();
    this.listeners.forEach(cb => cb(s));
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      volume: this.volume,
      step: this.currentStep
    };
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
  }

  public play() {
    this.initCtx();
    if (!this.ctx || this.isPlaying) return;

    this.isPlaying = true;
    this.currentStep = 0;
    this.notify();
    this.scheduleLoop();
  }

  public stop() {
    this.isPlaying = false;
    if (this.loopTimeout) {
      clearTimeout(this.loopTimeout);
      this.loopTimeout = null;
    }
    this.notify();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('nexora_music_volume', String(this.volume));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    this.notify();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('nexora_music_muted', String(this.isMuted));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    this.notify();
  }

  // 128 BPM: 1 beat = 60/128 = 0.46875s; 16th note = ~0.117s
  private scheduleLoop() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    const bpm = 126;
    const stepDuration = 60 / bpm / 4; // sixteenth note duration (~119ms)
    const totalSteps = 32; // 2 bars of 16 steps

    // Playful Chord Progression (C major -> G major -> A minor -> F major)
    // Frequencies (Hz)
    const C3 = 130.81, G2 = 98.00, A2 = 110.00, F2 = 87.31;
    const C4 = 261.63, E4 = 329.63, G4 = 392.00, B4 = 493.88, A4 = 440.00, F4 = 349.23, D4 = 293.66, C5 = 523.25;

    // Bass notes for 32 steps
    const bassNotes: (number | null)[] = [
      C3, null, C3, null, C3, null, C3, null,
      G2, null, G2, null, G2, null, G2, null,
      A2, null, A2, null, A2, null, A2, null,
      F2, null, F2, null, F2, null, G2, null
    ];

    // Cheerful Synth Arpeggio melody for 32 steps
    const melodyNotes: (number | null)[] = [
      C4, E4, G4, C5, G4, E4, C4, E4,
      B4, D4, G4, B4, G4, D4, B4, D4,
      C4, E4, A4, C5, A4, E4, C4, E4,
      A4, C4, F4, A4, B4, G4, D4, G4
    ];

    const now = this.ctx.currentTime;

    for (let step = 0; step < totalSteps; step++) {
      const time = now + step * stepDuration;

      // 1. Synth Arpeggio (Bright cheerful toy synth)
      const note = melodyNotes[step];
      if (note) {
        this.playSynthPluck(note, time, stepDuration * 0.85);
      }

      // 2. Bouncy Electro Bass
      const bass = bassNotes[step];
      if (bass) {
        this.playBassNote(bass, time, stepDuration * 0.9);
      }

      // 3. Playful Percussion (Kick on 0, 8, 16, 24; Snare on 4, 12, 20, 28; Hi-hat on every odd step)
      if (step % 8 === 0) {
        this.playKick(time);
      } else if (step % 8 === 4) {
        this.playSnare(time);
      }
      if (step % 2 === 1) {
        this.playHiHat(time);
      }
    }

    // Schedule next loop iteration
    const loopDurationMs = totalSteps * stepDuration * 1000;
    this.loopTimeout = setTimeout(() => {
      this.currentStep = (this.currentStep + 1) % 4;
      this.notify();
      this.scheduleLoop();
    }, loopDurationMs - 50);
  }

  private playSynthPluck(freq: number, time: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + duration);
    } catch {
      // quiet fallback
    }
  }

  private playBassNote(freq: number, time: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + duration);
    } catch {
      // quiet fallback
    }
  }

  private playKick(time: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(35, time + 0.1);

      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 0.12);
    } catch {
      // quiet fallback
    }
  }

  private playSnare(time: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, time);
      osc.frequency.exponentialRampToValueAtTime(80, time + 0.08);

      gain.gain.setValueAtTime(0.1, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 0.09);
    } catch {
      // quiet fallback
    }
  }

  private playHiHat(time: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(6000, time);

      gain.gain.setValueAtTime(0.035, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 0.03);
    } catch {
      // quiet fallback
    }
  }
}

export const music = new MusicEngine();
