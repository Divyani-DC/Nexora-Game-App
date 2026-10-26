import { useState } from 'react';
import { Sparkles, ArrowRight, Music, Users, ShieldAlert, Award, Compass, Heart } from 'lucide-react';
import { Mascot, CHAOS_CREW, MascotId, MascotExpression } from '../components/ChaosCrew.tsx';
import { MusicPlayerWidget } from '../components/MusicPlayerWidget.tsx';
import { InstallAppButton } from '../components/InstallAppButton.tsx';
import { AuthUser } from '../services/api.ts';
import { sound } from '../services/audio.ts';

interface WelcomeScreenProps {
  currentUser: AuthUser | null;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onOpenHowToPlay: () => void;
  onOpenRules: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export function WelcomeScreen({
  currentUser,
  onCreateRoom,
  onJoinRoom,
  onOpenHowToPlay,
  onOpenRules,
  onOpenAuth
}: WelcomeScreenProps) {
  const mascotsList: MascotId[] = ['pip', 'zap', 'mochi', 'pickle', 'boom'];
  const [activeMascotExpression, setActiveMascotExpression] = useState<{ [key: string]: MascotExpression }>({
    pip: 'excited',
    zap: 'celebrating',
    mochi: 'happy',
    pickle: 'suspicious',
    boom: 'celebrating'
  });

  const handleGetStarted = () => {
    sound.playClick();
    if (currentUser) {
      onCreateRoom();
    } else {
      onOpenAuth('register');
    }
  };

  const handleMascotTap = (mId: MascotId) => {
    sound.playClick();
    const expressions: MascotExpression[] = ['happy', 'excited', 'suspicious', 'shocked', 'celebrating', 'sleepy'];
    const current = activeMascotExpression[mId] || 'happy';
    const nextIdx = (expressions.indexOf(current) + 1) % expressions.length;
    setActiveMascotExpression(prev => ({ ...prev, [mId]: expressions[nextIdx] }));
  };

  return (
    <div className="relative min-h-[calc(100vh-73px)] flex flex-col justify-between px-4 sm:px-8 py-8 max-w-6xl mx-auto space-y-16">
      {/* Two-Part Hero Section (Left: Copy & CTAs, Right: Floating Mascot World) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4 sm:pt-10 pb-6">
        {/* Left Column (7 cols): Typography, Badge, Heading & CTAs */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          {/* Chaos Club Sticker Kicker */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD84D] border-3 border-[#302044] shadow-[3px_4px_0px_#302044] -rotate-1 hover:rotate-1 transition-transform">
            <Sparkles className="w-4 h-4 text-[#FF5DA2]" />
            <span className="font-bubble text-xs sm:text-sm font-extrabold text-[#302044] tracking-wide">
              MAKE FRIENDS · BREAK RULES · CAUSE CHAOS
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-bubble text-5xl sm:text-7xl lg:text-8xl font-black text-[#302044] tracking-tight leading-[0.95]">
            <span className="block text-[#302044]">YOUR FRIENDS.</span>
            <span className="block text-[#FF5DA2] drop-shadow-[3px_4px_0px_#FFE5F1]">YOUR CHAOS.</span>
            <span className="block text-[#53CFFF] drop-shadow-[3px_4px_0px_#E6F7FF]">YOUR GAME.</span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg font-bold text-[#756A84] max-w-xl leading-relaxed">
            Gather your favorite troublemakers. Solve ridiculous challenges. Outsmart your friends. Try not to get exposed.
          </p>

          {/* Primary & Secondary Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md pt-2">
            <button
              onClick={handleGetStarted}
              className="w-full btn-chunky btn-chunky-pink py-4 sm:py-5 px-8 text-lg sm:text-xl flex items-center justify-center gap-3 shadow-[0_6px_0_#B81F6C,0_9px_0_#302044] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-[#FFD84D]" />
              <span>{currentUser ? "LET'S PLAY! ✨" : "LET'S PLAY! ✨"}</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onJoinRoom();
              }}
              className="w-full btn-chunky btn-chunky-yellow py-4 sm:py-5 px-8 text-base sm:text-lg flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>JOIN THE CHAOS</span>
              <ArrowRight className="w-5 h-5 text-[#302044]" />
            </button>
          </div>

          {/* Quick PWA Install Option */}
          <div className="w-full max-w-md">
            <InstallAppButton variant="hero" className="w-full" />
          </div>

          {/* Supporting Tagline */}
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#756A84] tracking-wide pt-1">
            <span className="w-2 h-2 rounded-full bg-[#65DDB0] animate-ping" />
            <span>One room. Eight players. Absolutely unhinged energy.</span>
          </div>
        </div>

        {/* Right Column (5 cols): Official Art Showcase on Floating Island */}
        <div className="lg:col-span-5 flex justify-center relative">
          {/* Floating Island & Mascot Group Display */}
          <div className="relative w-full max-w-sm sm:max-w-md p-4 sm:p-6 flex flex-col items-center">
            {/* Rainbow Bridge Decor in background */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-48 h-24 overflow-hidden pointer-events-none opacity-80">
              <div className="w-48 h-48 rounded-full border-6 border-[#FF5DA2] border-b-0 border-l-0 border-r-0" />
              <div className="w-44 h-44 -mt-44 mx-auto rounded-full border-6 border-[#FFD84D] border-b-0 border-l-0 border-r-0" />
              <div className="w-40 h-40 -mt-40 mx-auto rounded-full border-6 border-[#53CFFF] border-b-0 border-l-0 border-r-0" />
            </div>

            {/* Official Artwork Centerpiece */}
            <div className="relative z-10 w-full max-w-[280px] sm:max-w-[340px] mb-3 group cursor-pointer transition-transform duration-300 hover:scale-105">
              <img
                src="/nexora-logo.png"
                alt="NEXORA The Chaos Club"
                className="w-full h-auto rounded-3xl border-3 border-[#302044] shadow-[6px_6px_0px_#302044] object-contain bg-white"
              />
              <span className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-[#FFD84D] border-2 border-[#302044] font-bubble text-xs font-black text-[#302044] shadow-[2px_2px_0px_#302044] rotate-6">
                OFFICIAL GAME
              </span>
            </div>

            {/* Interactive Mascot Crew Row */}
            <div className="relative z-10 w-full flex items-center justify-center gap-2 sm:gap-4 my-2">
              {/* Pip (center left) */}
              <div
                onClick={() => handleMascotTap('pip')}
                className="cursor-pointer transition-transform hover:scale-125 animate-float"
                title="Tap Pip!"
              >
                <Mascot character="pip" expression={activeMascotExpression.pip} size="lg" animate={true} />
              </div>

              {/* Zap (center) */}
              <div
                onClick={() => handleMascotTap('zap')}
                className="cursor-pointer transition-transform hover:scale-125 animate-float-reverse -mt-6"
                title="Tap Zap!"
              >
                <Mascot character="zap" expression={activeMascotExpression.zap} size="lg" animate={true} />
              </div>

              {/* Boom (center right) */}
              <div
                onClick={() => handleMascotTap('boom')}
                className="cursor-pointer transition-transform hover:scale-125 animate-float"
                title="Tap Boom!"
              >
                <Mascot character="boom" expression={activeMascotExpression.boom} size="lg" animate={true} />
              </div>
            </div>

            {/* Secondary Floating Mascots (Mochi & Pickle) */}
            <div className="flex items-center justify-center gap-6 z-10">
              <div
                onClick={() => handleMascotTap('mochi')}
                className="cursor-pointer transition-transform hover:scale-125"
                title="Tap Mochi!"
              >
                <Mascot character="mochi" expression={activeMascotExpression.mochi} size="md" />
              </div>
              <div
                onClick={() => handleMascotTap('pickle')}
                className="cursor-pointer transition-transform hover:scale-125"
                title="Tap Pickle!"
              >
                <Mascot character="pickle" expression={activeMascotExpression.pickle} size="md" />
              </div>
            </div>

            {/* Floating Island Podium Graphic */}
            <div className="w-64 sm:w-80 h-10 -mt-3 bg-[#FFF3D4] rounded-full border-3 border-[#302044] shadow-[0_8px_0_#EAE0C4,0_12px_24px_rgba(48,32,68,0.1)] flex items-center justify-center">
              <span className="font-bubble text-xs font-black text-[#FF8A3D] tracking-wider uppercase">
                ✦ THE CHAOS CREW PLAYGROUND ✦
              </span>
            </div>

            <p className="text-[11px] font-bold text-[#756A84] mt-3">
              Tap any mascot to see their funny expressions!
            </p>
          </div>
        </div>
      </div>

      {/* Featured Music Player Showcase Box */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-[#FF5DA2]" />
          <span className="font-bubble text-xs font-bold uppercase tracking-wider text-[#9671FF]">
            ORIGINAL CARTOON SOUNDTRACK
          </span>
        </div>
        <MusicPlayerWidget compact={false} />
      </div>

      {/* Meet the Chaos Crew Mascot Showcase */}
      <div className="space-y-6">
        <div className="text-center">
          <span className="font-bubble text-xs uppercase tracking-widest text-[#FF5DA2] font-bold bg-[#FFEAF3] px-3.5 py-1 rounded-full border-2 border-[#FF5DA2]">
            MEET THE CHAOS CREW
          </span>
          <h2 className="font-bubble text-3xl sm:text-4xl font-black text-[#302044] mt-2">
            Five Original Characters, Infinite Trouble
          </h2>
          <p className="text-xs font-semibold text-[#756A84] mt-1">
            Pick your character as your Clubhouse avatar when creating or joining rooms!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {mascotsList.map((mId) => {
            const info = CHAOS_CREW[mId];
            return (
              <div
                key={mId}
                onClick={() => handleMascotTap(mId)}
                className="toy-card-clean p-5 text-center flex flex-col items-center justify-between space-y-3 cursor-pointer group hover:border-[#FF5DA2]"
              >
                <div className="group-hover:scale-110 transition-transform">
                  <Mascot character={mId} expression={activeMascotExpression[mId] || 'happy'} size="md" animate={true} />
                </div>
                <div>
                  <h3 className="font-bubble text-lg font-bold text-[#302044]">{info.name}</h3>
                  <span className="text-[11px] font-bold text-[#FF8A3D] block mb-1">{info.title}</span>
                  <p className="text-[11px] text-[#756A84] leading-tight">
                    {info.personality}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF8E9] text-[#302044] border border-[#EAE4F5]">
                  Fav: {info.favoriteFood}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Game Modes Section on White Toy Cards */}
      <div className="space-y-6">
        <div className="text-center">
          <span className="font-bubble text-xs uppercase tracking-widest text-[#53CFFF] font-bold bg-[#ECF8FF] px-3.5 py-1 rounded-full border-2 border-[#53CFFF]">
            ARENA ATTRACTIONS
          </span>
          <h2 className="font-bubble text-3xl sm:text-4xl font-black text-[#302044] mt-2">
            Pick Your Flavor of Mayhem
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mode 1: Signal or Sabotage */}
          <div className="toy-card-pink p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFD84D] border-2 border-[#302044] text-[10px] font-bubble font-black text-[#302044]">
                  LIVE NOW ✦
                </span>
                <Mascot character="pickle" expression="suspicious" size="sm" />
              </div>
              <h3 className="font-bubble text-2xl font-bold text-[#302044]">
                SIGNAL OR SABOTAGE
              </h3>
              <p className="text-xs font-semibold text-[#756A84] leading-relaxed">
                Outsmart the group. Solve the challenges while spotting the secret infiltrator—or cause chaos as the Saboteur!
              </p>
            </div>
            <div className="mt-5 pt-4 border-t-2 border-[#302044]/10 flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#302044]/70">2 to 8 Players · 5 Rounds</span>
              <button
                onClick={() => {
                  sound.playClick();
                  onCreateRoom();
                }}
                className="btn-chunky btn-chunky-yellow px-3 py-1 text-xs"
              >
                Play
              </button>
            </div>
          </div>

          {/* Mode 2: Head-to-Head Duel */}
          <div className="toy-card-yellow p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-white border-2 border-[#302044] text-[10px] font-bubble font-bold text-[#302044]">
                  2-PLAYER DUEL MODE
                </span>
                <Mascot character="zap" expression="excited" size="sm" />
              </div>
              <h3 className="font-bubble text-2xl font-bold text-[#302044]">
                TACTICAL DUEL
              </h3>
              <p className="text-xs font-semibold text-[#756A84] leading-relaxed">
                When exactly 2 friends enter a room, NEXORA dynamically switches to intense head-to-head predictions!
              </p>
            </div>
            <div className="mt-5 pt-4 border-t-2 border-[#302044]/10 text-[11px] font-bold text-[#FF8A3D]">
              Fair Head-to-Head Scoring
            </div>
          </div>

          {/* Mode 3: Rapid Challenges */}
          <div className="toy-card-sky p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-white border-2 border-[#302044] text-[10px] font-bubble font-bold text-[#302044]">
                  PUZZLE ARSENAL
                </span>
                <Mascot character="mochi" expression="happy" size="sm" />
              </div>
              <h3 className="font-bubble text-2xl font-bold text-[#302044]">
                RAPID CHALLENGES
              </h3>
              <p className="text-xs font-semibold text-[#756A84] leading-relaxed">
                Logic Pulse ciphers, Quick Signals, Memory Echoes, and prediction grids generated on server-authoritative timers.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t-2 border-[#302044]/10 text-[11px] font-bold text-[#9671FF]">
              Curated Safe Questions
            </div>
          </div>
        </div>
      </div>

      {/* The 5 Living Worlds Showcase */}
      <div className="toy-card-clean p-8 sm:p-10 space-y-6">
        <div className="text-center">
          <span className="font-bubble text-xs uppercase tracking-widest text-[#9671FF] font-bold bg-[#F3EEFF] px-3.5 py-1 rounded-full border-2 border-[#9671FF]">
            LIVING WORLDS
          </span>
          <h2 className="font-bubble text-3xl sm:text-4xl font-black text-[#302044] mt-2">
            Explore 5 Interactive Cartoon Environments
          </h2>
          <p className="text-xs font-semibold text-[#756A84] max-w-lg mx-auto mt-1">
            Every game phase transforms the background into a distinct living cartoon attraction with parallax motion and 3D toys.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-2xl bg-[#FFF8FA] border-2 border-[#EAE4F5] text-center space-y-1.5">
            <span className="text-xl">☁️</span>
            <h4 className="font-bubble text-sm font-bold text-[#FF5DA2]">Candy Cloud Kingdom</h4>
            <p className="text-[11px] text-[#756A84]">Homepage playground with drifting smiling clouds and rainbow arches</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#FFFDF5] border-2 border-[#EAE4F5] text-center space-y-1.5">
            <span className="text-xl">🎪</span>
            <h4 className="font-bubble text-sm font-bold text-[#FF8A3D]">Chaos Playground</h4>
            <p className="text-[11px] text-[#756A84]">Lobby with floating platforms, character stickers, and bouncy gears</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#F8FBFF] border-2 border-[#EAE4F5] text-center space-y-1.5">
            <span className="text-xl">⚡</span>
            <h4 className="font-bubble text-sm font-bold text-[#53CFFF]">Brain Blast Arena</h4>
            <p className="text-[11px] text-[#756A84]">Game-show stage with spotlight glows and floating puzzle symbols</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#FAF8FF] border-2 border-[#EAE4F5] text-center space-y-1.5">
            <span className="text-xl">🔍</span>
            <h4 className="font-bubble text-sm font-bold text-[#9671FF]">Mystery Garden</h4>
            <p className="text-[11px] text-[#756A84]">Detective garden with clue scrolls, magnifying glasses, and suspect eyes</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#FFF5F8] border-2 border-[#EAE4F5] text-center space-y-1.5">
            <span className="text-xl">🏆</span>
            <h4 className="font-bubble text-sm font-bold text-[#65DDB0]">Victory Wonderland</h4>
            <p className="text-[11px] text-[#756A84]">Celebratory confetti bursts, golden trophies, and dancing mascots</p>
          </div>
        </div>
      </div>

      {/* Playful 3-Step Story */}
      <div className="toy-card-clean p-8 sm:p-10 space-y-8">
        <div className="text-center">
          <span className="font-bubble text-xs uppercase tracking-widest text-[#9671FF] font-bold bg-[#F3EEFF] px-3.5 py-1 rounded-full border-2 border-[#9671FF]">
            HOW IT WORKS
          </span>
          <h2 className="font-bubble text-3xl sm:text-4xl font-black text-[#302044] mt-2">
            Three Steps to Glory (or Humiliation)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center space-y-3 p-5 rounded-2xl bg-white border-2 border-[#EAE4F5] shadow-sm">
            <Mascot character="zap" size="md" />
            <span className="font-bubble text-xl font-bold text-[#302044]">1. Grab Your Crew</span>
            <p className="text-xs text-[#756A84] leading-relaxed">
              Create an arena room and send your 6-digit ticket code to 2–8 friends on phones, tablets, or laptops.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 p-5 rounded-2xl bg-white border-2 border-[#EAE4F5] shadow-sm">
            <Mascot character="pip" size="md" />
            <span className="font-bubble text-xl font-bold text-[#302044]">2. Tackle the Chaos</span>
            <p className="text-xs text-[#756A84] leading-relaxed">
              Five rounds of rapid logic puzzles and memory challenges while checking your secret round directive.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 p-5 rounded-2xl bg-white border-2 border-[#EAE4F5] shadow-sm">
            <Mascot character="pickle" size="md" />
            <span className="font-bubble text-xl font-bold text-[#302044]">3. Vote & Reveal</span>
            <p className="text-xs text-[#756A84] leading-relaxed">
              Interrogate your friends in the Mystery Garden, vote for the biggest liar, and crown the Chaos Champion!
            </p>
          </div>
        </div>
      </div>

      {/* Final Call to Action Toy Banner */}
      <div className="toy-card-yellow p-8 sm:p-12 text-center space-y-6">
        <h2 className="font-bubble text-3xl sm:text-5xl font-black text-[#302044]">
          Ready to Break Some Clubhouse Rules?
        </h2>
        <p className="text-sm font-bold text-[#756A84] max-w-md mx-auto">
          No app download required. Open a room in 3 seconds and cause some wholesome digital chaos!
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleGetStarted}
            className="btn-chunky btn-chunky-pink px-8 py-4 text-lg"
          >
            LET'S PLAY! ✨
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onJoinRoom();
            }}
            className="btn-chunky btn-chunky-white px-8 py-4 text-base"
          >
            I HAVE A ROOM CODE
          </button>
        </div>
      </div>
    </div>
  );
}
