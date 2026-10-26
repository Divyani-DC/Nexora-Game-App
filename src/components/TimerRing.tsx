import { useEffect, useState } from 'react';
import { sound } from '../services/audio.ts';

export function TimerRing({
  timerEndsAt,
  totalDuration = 25,
  size = 64
}: {
  timerEndsAt: number | null;
  totalDuration?: number;
  size?: number;
}) {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    if (!timerEndsAt) {
      setSecondsLeft(0);
      return;
    }

    const updateTimer = () => {
      const remainingMs = timerEndsAt - Date.now();
      const sec = Math.max(0, Math.ceil(remainingMs / 1000));
      setSecondsLeft(sec);

      // Play tick sound when 5s or less
      if (sec > 0 && sec <= 5 && remainingMs % 1000 < 120) {
        sound.playCountdownTick(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 200);
    return () => clearInterval(interval);
  }, [timerEndsAt]);

  if (!timerEndsAt) return null;

  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(1, Math.max(0, secondsLeft / (totalDuration || 25)));
  const strokeDashoffset = circumference - progress * circumference;

  const isUrgent = secondsLeft <= 5 && secondsLeft > 0;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${
        isUrgent ? 'animate-wiggle scale-110' : ''
      }`}
      style={{ width: size, height: size }}
    >
      <svg className="transform -rotate-90 drop-shadow-[2px_3px_0px_#302044]" width={size} height={size}>
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2D9C8"
          strokeWidth={strokeWidth}
          fill="#FFFFFF"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isUrgent ? '#FF5DA2' : '#FFD84D'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-200"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`font-bubble font-black text-sm ${
            isUrgent ? 'text-[#FF5DA2] scale-110' : 'text-[#302044]'
          }`}
        >
          {secondsLeft}s
        </span>
      </div>
    </div>
  );
}
