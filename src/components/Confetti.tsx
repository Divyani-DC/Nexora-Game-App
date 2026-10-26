import { useEffect, useRef } from 'react';

export function Confetti({ durationMs = 4500 }: { durationMs?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    interface ConfettiPiece {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      rotation: number;
      vRot: number;
      color: string;
      alpha: number;
    }

    const colors = ['#FF4FA3', '#8B7CFF', '#FFFFFF', '#38BDF8', '#F43F5E'];
    const pieces: ConfettiPiece[] = [];

    for (let i = 0; i < 90; i++) {
      pieces.push({
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height / 2 + (Math.random() - 0.5) * 50,
        size: Math.random() * 8 + 4,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 12 - 4,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1
      });
    }

    const startTime = Date.now();

    const render = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, width, height);

      for (const p of pieces) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.vx *= 0.98; // drag
        p.rotation += p.vRot;

        if (elapsed > durationMs - 1000) {
          p.alpha = Math.max(0, (durationMs - elapsed) / 1000);
        }
      }

      if (elapsed < durationMs) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [durationMs]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    />
  );
}
