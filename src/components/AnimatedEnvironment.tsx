import { useEffect, useRef, useState } from 'react';
import { sound } from '../services/audio.ts';

export type EnvironmentType =
  | 'CANDY_CLOUD_KINGDOM'
  | 'CHAOS_PLAYGROUND'
  | 'BRAIN_BLAST_ARENA'
  | 'MYSTERY_GARDEN'
  | 'VICTORY_WONDERLAND'
  | 'CANDY_SKY'
  | 'GAME_SHOW'
  | 'MYSTERY_MODE'
  | 'VICTORY_FESTIVAL';

interface AnimatedEnvironmentProps {
  environment: EnvironmentType;
}

export function AnimatedEnvironment({ environment }: AnimatedEnvironmentProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePos = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const [interactiveCloudHappy, setInteractiveCloudHappy] = useState(false);
  const [starWiggle, setStarWiggle] = useState(false);
  const [balloonY, setBalloonY] = useState(0);

  // Normalize world name
  const worldName: 'CANDY_CLOUD_KINGDOM' | 'CHAOS_PLAYGROUND' | 'BRAIN_BLAST_ARENA' | 'MYSTERY_GARDEN' | 'VICTORY_WONDERLAND' =
    environment === 'CANDY_SKY'
      ? 'CANDY_CLOUD_KINGDOM'
      : environment === 'GAME_SHOW'
      ? 'BRAIN_BLAST_ARENA'
      : environment === 'MYSTERY_MODE'
      ? 'MYSTERY_GARDEN'
      : environment === 'VICTORY_FESTIVAL'
      ? 'VICTORY_WONDERLAND'
      : (environment as any);

  // Mouse move listener for smooth multi-layer parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.targetX = e.clientX / window.innerWidth;
      mousePos.current.targetY = e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Main Canvas World Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = width < 768;

    // 1. Drifting Clouds Layer
    interface Cloud {
      x: number;
      y: number;
      speed: number;
      scale: number;
      opacity: number;
      hasFace?: boolean;
    }
    const clouds: Cloud[] = [];
    const cloudCount = isMobile ? 4 : 8;
    for (let i = 0; i < cloudCount; i++) {
      clouds.push({
        x: (width / cloudCount) * i + Math.random() * 50,
        y: Math.random() * (height * 0.45) + 30,
        speed: (Math.random() * 0.2 + 0.15) * (prefersReducedMotion ? 0.3 : 1),
        scale: Math.random() * 0.5 + 0.7,
        opacity: Math.random() * 0.25 + 0.75,
        hasFace: i % 2 === 0
      });
    }

    // 2. Floating 3D Toy-like Objects
    interface ToyObject {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      rot: number;
      rotSpeed: number;
      bobSpeed: number;
      bobPhase: number;
      bobAmount: number;
      parallaxFactor: number;
      type: 'star' | 'donut' | 'sphere' | 'heart' | 'cube' | 'clue' | 'ring';
      color: string;
      accentColor: string;
    }

    const toyPalette = {
      pink: '#FF5DA2',
      purple: '#9671FF',
      orange: '#FF8A3D',
      yellow: '#FFD84D',
      blue: '#53CFFF',
      mint: '#65DDB0',
      softLavender: '#E4DCFF'
    };

    const toys: ToyObject[] = [];
    const toyCount = isMobile ? 8 : 16;
    const objectTypes: ToyObject['type'][] =
      worldName === 'MYSTERY_GARDEN'
        ? ['clue', 'star', 'sphere', 'donut']
        : worldName === 'BRAIN_BLAST_ARENA'
        ? ['star', 'ring', 'cube', 'donut']
        : worldName === 'VICTORY_WONDERLAND'
        ? ['star', 'heart', 'donut', 'sphere']
        : ['star', 'donut', 'sphere', 'heart', 'cube'];

    const colors = Object.values(toyPalette);

    for (let i = 0; i < toyCount; i++) {
      const bx = Math.random() * width;
      const by = Math.random() * height;
      toys.push({
        x: bx,
        y: by,
        baseX: bx,
        baseY: by,
        size: Math.random() * 18 + 14,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * (prefersReducedMotion ? 0.005 : 0.02),
        bobSpeed: Math.random() * 0.03 + 0.015,
        bobPhase: Math.random() * Math.PI * 2,
        bobAmount: Math.random() * 12 + 6,
        parallaxFactor: Math.random() * 25 + 10,
        type: objectTypes[i % objectTypes.length],
        color: colors[i % colors.length],
        accentColor: colors[(i + 2) % colors.length]
      });
    }

    // 3. Floating Island Positions (Candy Kingdom, Playground, etc.)
    interface Island {
      x: number;
      y: number;
      width: number;
      color: string;
      treeColor: string;
      hasRainbow?: boolean;
    }
    const islands: Island[] = [
      { x: width * 0.12, y: height * 0.38, width: 140, color: '#FFF3D4', treeColor: '#70E6BB' },
      { x: width * 0.84, y: height * 0.32, width: 160, color: '#FFEBF3', treeColor: '#FF5DA2', hasRainbow: true },
      { x: width * 0.08, y: height * 0.78, width: 180, color: '#EBF7FF', treeColor: '#53CFFF' },
      { x: width * 0.88, y: height * 0.82, width: 150, color: '#F3EDFF', treeColor: '#9671FF' }
    ];

    // Helper functions for drawing 3D cartoon shapes
    const drawCartoonCloud = (cx: number, cy: number, scale: number, opacity: number, hasFace: boolean) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.globalAlpha = opacity;

      // Soft shadow
      ctx.fillStyle = 'rgba(215, 226, 245, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 10, 36, 0, Math.PI * 2);
      ctx.arc(-32, 14, 26, 0, Math.PI * 2);
      ctx.arc(32, 14, 28, 0, Math.PI * 2);
      ctx.fill();

      // Cloud body - Pure White with soft edge
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.arc(-32, 6, 26, 0, Math.PI * 2);
      ctx.arc(32, 6, 28, 0, Math.PI * 2);
      ctx.arc(-16, 14, 26, 0, Math.PI * 2);
      ctx.arc(16, 14, 26, 0, Math.PI * 2);
      ctx.fill();

      // Subtle cartoon border
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Smiling face
      if (hasFace) {
        ctx.fillStyle = '#302044';
        // Left eye
        ctx.beginPath();
        ctx.arc(-12, 4, 3, 0, Math.PI * 2);
        ctx.fill();
        // Right eye
        ctx.beginPath();
        ctx.arc(12, 4, 3, 0, Math.PI * 2);
        ctx.fill();
        // Rosy cheeks
        ctx.fillStyle = 'rgba(255, 93, 162, 0.45)';
        ctx.beginPath();
        ctx.arc(-18, 9, 4, 0, Math.PI * 2);
        ctx.arc(18, 9, 4, 0, Math.PI * 2);
        ctx.fill();
        // Smile curve
        ctx.strokeStyle = '#302044';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 8, 6, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawPuffyStar = (x: number, y: number, r: number, color: string, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);

      // 3D Shadow layer
      ctx.fillStyle = 'rgba(48, 32, 68, 0.12)';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const sa = a + Math.PI / 5;
        const outerR = r;
        const innerR = r * 0.45;
        ctx.lineTo(Math.cos(a) * outerR, Math.sin(a) * outerR + 4);
        ctx.lineTo(Math.cos(sa) * innerR, Math.sin(sa) * innerR + 4);
      }
      ctx.closePath();
      ctx.fill();

      // Star Body
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const sa = a + Math.PI / 5;
        const outerR = r;
        const innerR = r * 0.45;
        ctx.lineTo(Math.cos(a) * outerR, Math.sin(a) * outerR);
        ctx.lineTo(Math.cos(sa) * innerR, Math.sin(sa) * innerR);
      }
      ctx.closePath();
      ctx.fill();

      // Glossy 3D Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.beginPath();
      ctx.arc(-r * 0.2, -r * 0.2, r * 0.28, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawJellySphere = (x: number, y: number, r: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);

      // Soft drop shadow
      ctx.fillStyle = 'rgba(48, 32, 68, 0.1)';
      ctx.beginPath();
      ctx.ellipse(0, r + 4, r * 0.8, r * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sphere base
      const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.3, color);
      grad.addColorStop(1, '#302044');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Glossy specular dot
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(-r * 0.35, -r * 0.35, r * 0.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawDonutRing = (x: number, y: number, r: number, color: string, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);

      // Ring shadow
      ctx.strokeStyle = 'rgba(48, 32, 68, 0.1)';
      ctx.lineWidth = r * 0.45;
      ctx.beginPath();
      ctx.ellipse(0, 4, r, r * 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Ring body
      ctx.strokeStyle = color;
      ctx.lineWidth = r * 0.45;
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Highlights
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = r * 0.15;
      ctx.beginPath();
      ctx.ellipse(-r * 0.2, -r * 0.1, r * 0.7, r * 0.4, 0, Math.PI, Math.PI * 1.8);
      ctx.stroke();

      ctx.restore();
    };

    const drawFloatingIsland = (island: Island, parallaxX: number, parallaxY: number) => {
      ctx.save();
      const ix = island.x + parallaxX * 0.5;
      const iy = island.y + parallaxY * 0.5;
      ctx.translate(ix, iy);

      // Rainbow Bridge if present
      if (island.hasRainbow) {
        ctx.lineWidth = 4;
        const rainbowColors = ['#FF5DA2', '#FFD84D', '#53CFFF', '#9671FF'];
        rainbowColors.forEach((rc, rIdx) => {
          ctx.strokeStyle = rc;
          ctx.beginPath();
          ctx.arc(-island.width * 0.3, -40 + rIdx * 4, 60, Math.PI * 0.9, Math.PI * 1.9);
          ctx.stroke();
        });
      }

      // Island Underneath (Soft 3D cone/rock)
      ctx.fillStyle = '#EBE4F5';
      ctx.beginPath();
      ctx.ellipse(0, 0, island.width * 0.5, 22, 0, 0, Math.PI);
      ctx.lineTo(0, 44);
      ctx.closePath();
      ctx.fill();

      // Top Grassy / Candy Surface
      ctx.fillStyle = island.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, island.width * 0.5, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#D9CFEC';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tiny Pastel Tree on Island
      ctx.fillStyle = '#C29B78';
      ctx.fillRect(-6, -26, 6, 26);
      ctx.fillStyle = island.treeColor;
      ctx.beginPath();
      ctx.arc(-3, -34, 16, 0, Math.PI * 2);
      ctx.fill();
      // Little highlight on tree
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(-7, -38, 6, 0, Math.PI * 2);
      ctx.fill();

      // Tiny Cute House
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(island.width * 0.15, -20, 18, 16);
      ctx.fillStyle = '#FF5DA2';
      ctx.beginPath();
      ctx.moveTo(island.width * 0.15 - 3, -20);
      ctx.lineTo(island.width * 0.15 + 9, -32);
      ctx.lineTo(island.width * 0.15 + 21, -20);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    let tick = 0;

    const render = () => {
      tick++;

      // Smooth mouse position lerping
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.05;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.05;
      const pOffsetX = (mousePos.current.x - 0.5) * 40;
      const pOffsetY = (mousePos.current.y - 0.5) * 40;

      ctx.clearRect(0, 0, width, height);

      // Base Gradient Sky: Clean Bright White with world tint
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (worldName === 'CANDY_CLOUD_KINGDOM') {
        skyGrad.addColorStop(0, '#FFFFFF');
        skyGrad.addColorStop(0.5, '#F9FBFF');
        skyGrad.addColorStop(1, '#FFF5F8');
      } else if (worldName === 'CHAOS_PLAYGROUND') {
        skyGrad.addColorStop(0, '#FFFFFF');
        skyGrad.addColorStop(0.6, '#F8FAFF');
        skyGrad.addColorStop(1, '#FFF9E8');
      } else if (worldName === 'BRAIN_BLAST_ARENA') {
        skyGrad.addColorStop(0, '#FFFFFF');
        skyGrad.addColorStop(0.5, '#FFFDF5');
        skyGrad.addColorStop(1, '#F3F9FF');
      } else if (worldName === 'MYSTERY_GARDEN') {
        skyGrad.addColorStop(0, '#FFFFFF');
        skyGrad.addColorStop(0.5, '#F8F6FF');
        skyGrad.addColorStop(1, '#EDFBF5');
      } else {
        // VICTORY_WONDERLAND
        skyGrad.addColorStop(0, '#FFFFFF');
        skyGrad.addColorStop(0.4, '#FFF8F4');
        skyGrad.addColorStop(1, '#FFF0F7');
      }

      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Render Floating Islands
      islands.forEach((isl) => {
        drawFloatingIsland(isl, pOffsetX * 0.3, pOffsetY * 0.3);
      });

      // Render Drifting Clouds
      clouds.forEach((c) => {
        c.x += c.speed;
        if (c.x - 100 > width) {
          c.x = -100;
          c.y = Math.random() * (height * 0.45) + 30;
        }
        const cloudParallaxX = pOffsetX * 0.15;
        const cloudParallaxY = pOffsetY * 0.15;
        drawCartoonCloud(c.x + cloudParallaxX, c.y + cloudParallaxY, c.scale, c.opacity, !!c.hasFace);
      });

      // Render Floating 3D Toy-like Objects
      toys.forEach((t) => {
        t.rot += t.rotSpeed;
        const bob = Math.sin(tick * t.bobSpeed + t.bobPhase) * t.bobAmount;
        const px = t.baseX + pOffsetX * (t.parallaxFactor / 40);
        const py = t.baseY + bob + pOffsetY * (t.parallaxFactor / 40);

        if (t.type === 'star') {
          drawPuffyStar(px, py, t.size, t.color, t.rot);
        } else if (t.type === 'donut' || t.type === 'ring') {
          drawDonutRing(px, py, t.size, t.color, t.rot);
        } else if (t.type === 'sphere') {
          drawJellySphere(px, py, t.size, t.color);
        } else if (t.type === 'heart') {
          drawPuffyStar(px, py, t.size * 0.8, t.color, t.rot);
        } else if (t.type === 'clue') {
          // Cartoon Clue Magnifier
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(t.rot);
          ctx.strokeStyle = '#9671FF';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, -6, 12, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(8, 2);
          ctx.lineTo(16, 14);
          ctx.stroke();
          ctx.restore();
        } else {
          drawJellySphere(px, py, t.size, t.color);
        }
      });

      // World-specific Ambient Highlights
      if (worldName === 'BRAIN_BLAST_ARENA') {
        // Soft sunny stage spotlight glow on pure white
        const spotX = width * 0.5 + Math.sin(tick * 0.02) * (width * 0.2);
        const spotGrad = ctx.createRadialGradient(spotX, 0, 80, spotX, height * 0.7, height * 0.6);
        spotGrad.addColorStop(0, 'rgba(255, 216, 77, 0.12)');
        spotGrad.addColorStop(1, 'rgba(255, 216, 77, 0)');
        ctx.fillStyle = spotGrad;
        ctx.fillRect(0, 0, width, height);
      } else if (worldName === 'MYSTERY_GARDEN') {
        // Soft lavender mystery glow
        const mistX = width * 0.5 + Math.cos(tick * 0.015) * 80;
        const mistGrad = ctx.createRadialGradient(mistX, height * 0.4, 60, mistX, height * 0.6, height * 0.5);
        mistGrad.addColorStop(0, 'rgba(150, 113, 255, 0.09)');
        mistGrad.addColorStop(1, 'rgba(150, 113, 255, 0)');
        ctx.fillStyle = mistGrad;
        ctx.fillRect(0, 0, width, height);
      } else if (worldName === 'VICTORY_WONDERLAND') {
        // Rainbow confetti flutter
        ctx.fillStyle = 'rgba(255, 93, 162, 0.7)';
        for (let i = 0; i < (isMobile ? 10 : 25); i++) {
          const fx = (Math.sin(tick * 0.02 + i) * width * 0.5 + width * 0.5) % width;
          const fy = ((tick * 2 + i * 50) % height);
          ctx.fillRect(fx, fy, 6, 9);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [worldName]);

  // Interactive Foreground Object Triggers
  const handleStarClick = () => {
    sound.playClick();
    setStarWiggle(true);
    setTimeout(() => setStarWiggle(false), 800);
  };

  const handleCloudClick = () => {
    sound.playClick();
    setInteractiveCloudHappy((prev) => !prev);
  };

  const handleBalloonClick = () => {
    sound.playClick();
    setBalloonY((prev) => (prev <= -60 ? 0 : prev - 24));
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Living Multi-Layer Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Interactive Foreground Elements with pointer-events-auto */}
      {/* 1. Playful Peeking Cloud in Upper-Left Corner */}
      <button
        onClick={handleCloudClick}
        aria-label="Interactive smiling cloud"
        className="pointer-events-auto absolute top-20 left-4 sm:left-8 p-2 group cursor-pointer transition-transform hover:scale-110 active:scale-95 focus:outline-none"
        title="Tickle the cloud! ☁️"
      >
        <div className="relative">
          <svg width="72" height="46" viewBox="0 0 72 46" fill="none">
            {/* Cloud shadow */}
            <path
              d="M16 38C8 38 2 32 2 24C2 17 7 11 14 10C17 4 23 0 30 0C38 0 44 4 47 11C50 9 54 8 58 8C66 8 72 14 72 22C72 30 65 37 57 38H16Z"
              fill="#EBF3FD"
            />
            {/* Cloud body */}
            <path
              d="M16 34C8 34 2 28 2 20C2 13 7 7 14 6C17 2 23 0 30 0C38 0 44 4 47 9C50 7 54 6 58 6C66 6 72 12 72 20C72 28 65 34 57 34H16Z"
              fill="#FFFFFF"
              stroke="#DCE7F6"
              strokeWidth="2"
            />
            {/* Rosy Cheeks */}
            <circle cx="20" cy="22" r="3.5" fill="#FF5DA2" opacity="0.6" />
            <circle cx="48" cy="22" r="3.5" fill="#FF5DA2" opacity="0.6" />
            {/* Eyes */}
            {interactiveCloudHappy ? (
              <>
                <path d="M18 16Q21 12 24 16" stroke="#302044" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M44 16Q47 12 50 16" stroke="#302044" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M29 23Q34 29 39 23" stroke="#FF5DA2" strokeWidth="3" strokeLinecap="round" />
              </>
            ) : (
              <>
                <circle cx="21" cy="16" r="2.5" fill="#302044" />
                <circle cx="47" cy="16" r="2.5" fill="#302044" />
                <path d="M30 22Q34 26 38 22" stroke="#302044" strokeWidth="2" strokeLinecap="round" />
              </>
            )}
          </svg>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bubble font-bold text-[#FF5DA2] whitespace-nowrap bg-white px-2 py-0.5 rounded-full border border-[#FF5DA2] shadow-sm">
            {interactiveCloudHappy ? 'Hehe! ✨' : 'Click me!'}
          </span>
        </div>
      </button>

      {/* 2. Interactive Puffy Star near Top Right */}
      <button
        onClick={handleStarClick}
        aria-label="Interactive lucky star"
        className={`pointer-events-auto absolute top-24 right-6 sm:right-12 cursor-pointer transition-transform hover:scale-125 active:scale-95 focus:outline-none ${
          starWiggle ? 'animate-wiggle' : 'animate-float'
        }`}
        title="Tap the lucky star! ⭐"
      >
        <div className="relative group">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path
              d="M22 2L27 15L41 16L30 26L33 40L22 33L11 40L14 26L3 16L17 15L22 2Z"
              fill="#FFD84D"
              stroke="#E8B800"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Sparkle face */}
            <circle cx="17" cy="20" r="2" fill="#302044" />
            <circle cx="27" cy="20" r="2" fill="#302044" />
            <path d="M20 25Q22 27 24 25" stroke="#302044" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </button>

      {/* 3. Floating Candy Balloon in Lower Left Corner */}
      <button
        onClick={handleBalloonClick}
        style={{ transform: `translateY(${balloonY}px)` }}
        aria-label="Interactive floating candy balloon"
        className="pointer-events-auto hidden md:block absolute bottom-12 left-10 cursor-pointer transition-transform duration-500 hover:scale-110 active:scale-90 focus:outline-none"
        title="Send balloon higher! 🎈"
      >
        <div className="relative group flex flex-col items-center">
          <svg width="38" height="52" viewBox="0 0 38 52" fill="none">
            <ellipse cx="19" cy="20" rx="17" ry="20" fill="#FF5DA2" />
            <ellipse cx="13" cy="14" rx="4" ry="6" fill="#FFFFFF" opacity="0.6" />
            <polygon points="17,40 21,40 19,43" fill="#FF5DA2" />
            <path d="M19 43Q22 47 19 51" stroke="#302044" strokeWidth="1.5" fill="none" />
          </svg>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 text-[10px] font-bubble font-bold text-[#FF5DA2] whitespace-nowrap bg-white px-2 py-0.5 rounded-full border border-[#FF5DA2] shadow-sm">
            Float!
          </span>
        </div>
      </button>
    </div>
  );
}
