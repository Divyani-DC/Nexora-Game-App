import { useEffect, useRef } from 'react';

export function PlayfulBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
    const count = prefersReducedMotion ? 12 : 28;

    interface FloatingItem {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      rot: number;
      vRot: number;
      type: 'star' | 'circle' | 'sparkle' | 'cross';
      color: string;
    }

    const colors = [
      '#FF5DA2', // Pink
      '#FF8A3D', // Tangerine
      '#FFD84D', // Yellow
      '#9B72FF', // Purple
      '#53CFFF', // Blue
      '#70E6BB'  // Mint
    ];

    const types: FloatingItem['type'][] = ['star', 'circle', 'sparkle', 'cross'];
    const items: FloatingItem[] = [];

    for (let i = 0; i < count; i++) {
      items.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (prefersReducedMotion ? 0.1 : 0.35),
        vy: (Math.random() - 0.5) * (prefersReducedMotion ? 0.1 : 0.35),
        size: Math.random() * 8 + 6,
        rot: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 0.8,
        type: types[Math.floor(Math.random() * types.length)],
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const drawStar = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const x = cx + Math.cos(outerAngle) * r;
        const y = cy + Math.sin(outerAngle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    };

    const drawSparkle = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.quadraticCurveTo(cx, cy, cx + r, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy + r);
      ctx.quadraticCurveTo(cx, cy, cx - r, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy - r);
      ctx.fill();
    };

    const drawCross = (cx: number, cy: number, r: number) => {
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy);
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy + r);
      ctx.stroke();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (const item of items) {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate((item.rot * Math.PI) / 180);
        ctx.fillStyle = item.color;
        ctx.strokeStyle = item.color;
        ctx.globalAlpha = 0.35;

        if (item.type === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, item.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (item.type === 'star') {
          drawStar(0, 0, item.size);
        } else if (item.type === 'sparkle') {
          drawSparkle(0, 0, item.size);
        } else if (item.type === 'cross') {
          drawCross(0, 0, item.size / 1.5);
        }

        ctx.restore();

        item.x += item.vx;
        item.y += item.vy;
        item.rot += item.vRot;

        if (item.x < -20) item.x = width + 20;
        if (item.x > width + 20) item.x = -20;
        if (item.y < -20) item.y = height + 20;
        if (item.y > height + 20) item.y = -20;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
