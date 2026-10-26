export type MascotId = 'pip' | 'zap' | 'mochi' | 'pickle' | 'boom';
export type MascotExpression = 'happy' | 'excited' | 'suspicious' | 'shocked' | 'celebrating' | 'sleepy';

export interface MascotInfo {
  id: MascotId;
  name: string;
  title: string;
  personality: string;
  colorHex: string;
  accentHex: string;
  favoriteFood: string;
}

export const CHAOS_CREW: Record<MascotId, MascotInfo> = {
  pip: {
    id: 'pip',
    name: 'PIP',
    title: 'The Energetic Blob',
    personality: 'Impulsive, squishy, and always ready to push the big red button!',
    colorHex: '#FF5DA2',
    accentHex: '#FFE6F1',
    favoriteFood: 'Cotton Candy'
  },
  zap: {
    id: 'zap',
    name: 'ZAP',
    title: 'The Electric Gremlin',
    personality: 'Zero patience, 100% speed. Moves before thinking!',
    colorHex: '#53CFFF',
    accentHex: '#E2F7FF',
    favoriteFood: 'Pop Rocks'
  },
  mochi: {
    id: 'mochi',
    name: 'MOCHI',
    title: 'The Sleepy Genius',
    personality: 'Looks like they just woke up, but secretly solved the puzzle 10 seconds ago.',
    colorHex: '#9B72FF',
    accentHex: '#EFE9FF',
    favoriteFood: 'Boba Milk Tea'
  },
  pickle: {
    id: 'pickle',
    name: 'PICKLE',
    title: 'The Sneaky Trickster',
    personality: 'Was definitely the Saboteur, even when they weren’t assigned the role.',
    colorHex: '#70E6BB',
    accentHex: '#E2FAF1',
    favoriteFood: 'Sour Gummies'
  },
  boom: {
    id: 'boom',
    name: 'BOOM',
    title: 'The Celebration Monster',
    personality: 'Throws confetti whether they win, lose, or just find a shiny coin!',
    colorHex: '#FF8A3D',
    accentHex: '#FFF0E6',
    favoriteFood: 'Birthday Cake'
  }
};

interface MascotProps {
  character: MascotId;
  expression?: MascotExpression;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  animate?: boolean;
}

export function Mascot({
  character,
  expression = 'happy',
  size = 'md',
  className = '',
  animate = false
}: MascotProps) {
  const sizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
    hero: 'w-48 h-48 sm:w-60 sm:h-60'
  };

  const animClass = animate ? 'animate-bounce-gentle' : '';

  // Render original vector artwork for each Chaos Crew mascot
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${sizeMap[size]} ${animClass} ${className}`}>
      {character === 'pip' && <PipSvg expression={expression} />}
      {character === 'zap' && <ZapSvg expression={expression} />}
      {character === 'mochi' && <MochiSvg expression={expression} />}
      {character === 'pickle' && <PickleSvg expression={expression} />}
      {character === 'boom' && <BoomSvg expression={expression} />}
    </div>
  );
}

// -------------------------------------------------------------
// 1. PIP — The Energetic Blob (Pink Squish)
// -------------------------------------------------------------
function PipSvg({ expression }: { expression: MascotExpression }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
      {/* Tiny bouncy feet */}
      <ellipse cx="36" cy="90" rx="9" ry="5" fill="#D4387E" stroke="#302044" strokeWidth="3" />
      <ellipse cx="64" cy="90" rx="9" ry="5" fill="#D4387E" stroke="#302044" strokeWidth="3" />

      {/* Main squishy body */}
      <path
        d="M20,60 C15,35 30,12 50,12 C70,12 85,35 80,60 C76,82 68,88 50,88 C32,88 24,82 20,60 Z"
        fill="#FF5DA2"
        stroke="#302044"
        strokeWidth="3.5"
      />
      {/* Body highlight */}
      <path
        d="M32,22 C42,16 58,16 68,22 C64,28 36,28 32,22 Z"
        fill="#FFA4CD"
        opacity="0.75"
      />

      {/* Tiny Hands */}
      {expression === 'celebrating' ? (
        <>
          <ellipse cx="16" cy="38" rx="6" ry="6" fill="#FF5DA2" stroke="#302044" strokeWidth="3" />
          <ellipse cx="84" cy="38" rx="6" ry="6" fill="#FF5DA2" stroke="#302044" strokeWidth="3" />
        </>
      ) : (
        <>
          <ellipse cx="18" cy="58" rx="6" ry="6" fill="#FF5DA2" stroke="#302044" strokeWidth="3" />
          <ellipse cx="82" cy="58" rx="6" ry="6" fill="#FF5DA2" stroke="#302044" strokeWidth="3" />
        </>
      )}

      {/* Big Eyes */}
      {expression === 'suspicious' ? (
        <>
          <ellipse cx="38" cy="46" rx="9" ry="5" fill="#FFFFFF" stroke="#302044" strokeWidth="3" />
          <ellipse cx="62" cy="46" rx="9" ry="5" fill="#FFFFFF" stroke="#302044" strokeWidth="3" />
          <circle cx="34" cy="46" r="3.5" fill="#302044" />
          <circle cx="58" cy="46" r="3.5" fill="#302044" />
        </>
      ) : expression === 'shocked' ? (
        <>
          <circle cx="38" cy="44" r="10" fill="#FFFFFF" stroke="#302044" strokeWidth="3" />
          <circle cx="62" cy="44" r="10" fill="#FFFFFF" stroke="#302044" strokeWidth="3" />
          <circle cx="38" cy="44" r="3" fill="#302044" />
          <circle cx="62" cy="44" r="3" fill="#302044" />
        </>
      ) : (
        <>
          <circle cx="38" cy="44" r="9" fill="#FFFFFF" stroke="#302044" strokeWidth="3" />
          <circle cx="62" cy="44" r="9" fill="#FFFFFF" stroke="#302044" strokeWidth="3" />
          <circle cx="40" cy="43" r="5" fill="#302044" />
          <circle cx="64" cy="43" r="5" fill="#302044" />
          <circle cx="42" cy="40" r="2" fill="#FFFFFF" />
          <circle cx="66" cy="40" r="2" fill="#FFFFFF" />
        </>
      )}

      {/* Rosy Cheeks */}
      <circle cx="27" cy="55" r="4.5" fill="#FF8EC1" />
      <circle cx="73" cy="55" r="4.5" fill="#FF8EC1" />

      {/* Mouth */}
      {expression === 'shocked' ? (
        <circle cx="50" cy="62" r="6" fill="#302044" />
      ) : expression === 'suspicious' ? (
        <path d="M44,60 Q50,56 56,60" fill="none" stroke="#302044" strokeWidth="3" strokeLinecap="round" />
      ) : expression === 'celebrating' || expression === 'excited' ? (
        <path d="M40,56 Q50,72 60,56 Z" fill="#900C3F" stroke="#302044" strokeWidth="2.5" />
      ) : (
        <path d="M42,57 Q50,66 58,57" fill="none" stroke="#302044" strokeWidth="3" strokeLinecap="round" />
      )}
    </svg>
  );
}

// -------------------------------------------------------------
// 2. ZAP — The Electric Gremlin (Cyan Lightning)
// -------------------------------------------------------------
function ZapSvg({ expression }: { expression: MascotExpression }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
      {/* Feet */}
      <ellipse cx="38" cy="88" rx="8" ry="4.5" fill="#28A5D6" stroke="#302044" strokeWidth="3" />
      <ellipse cx="62" cy="88" rx="8" ry="4.5" fill="#28A5D6" stroke="#302044" strokeWidth="3" />

      {/* Lightning Shaped Body */}
      <polygon
        points="50,8 72,36 56,40 76,82 32,82 46,48 28,48"
        fill="#53CFFF"
        stroke="#302044"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Yellow forehead spark badge */}
      <polygon points="50,18 54,26 62,26 56,32 58,40 50,34 42,40 44,32 38,26 46,26" fill="#FFD84D" />

      {/* Big cartoon eyes */}
      <circle cx="43" cy="58" r="8" fill="#FFFFFF" stroke="#302044" strokeWidth="2.5" />
      <circle cx="61" cy="58" r="8" fill="#FFFFFF" stroke="#302044" strokeWidth="2.5" />
      <circle cx="44" cy="58" r="4.5" fill="#302044" />
      <circle cx="62" cy="58" r="4.5" fill="#302044" />
      <circle cx="46" cy="56" r="1.5" fill="#FFFFFF" />
      <circle cx="64" cy="56" r="1.5" fill="#FFFFFF" />

      {/* Eyebrows */}
      <path d="M37,49 L48,51" stroke="#302044" strokeWidth="3" strokeLinecap="round" />
      <path d="M67,49 L56,51" stroke="#302044" strokeWidth="3" strokeLinecap="round" />

      {/* Energetic Mouth */}
      <path d="M46,69 Q52,76 58,69" fill="none" stroke="#302044" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// -------------------------------------------------------------
// 3. MOCHI — The Sleepy Genius (Lavender Cloud with Specs)
// -------------------------------------------------------------
function MochiSvg({ expression }: { expression: MascotExpression }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
      {/* Cloud-like rounded body */}
      <path
        d="M26,68 C16,68 12,50 22,40 C18,26 34,16 48,22 C58,14 76,20 78,34 C88,40 88,60 76,68 C78,82 64,88 50,86 C36,88 24,80 26,68 Z"
        fill="#9B72FF"
        stroke="#302044"
        strokeWidth="3.5"
      />
      {/* Little curled antenna */}
      <path d="M50,20 Q54,10 60,12 Q64,14 62,18" fill="none" stroke="#302044" strokeWidth="3" strokeLinecap="round" />
      <circle cx="62" cy="18" r="3.5" fill="#FFD84D" stroke="#302044" strokeWidth="2" />

      {/* Oversized Cute Round Glasses */}
      <circle cx="37" cy="50" r="11" fill="#FFFFFF" stroke="#302044" strokeWidth="3.5" />
      <circle cx="63" cy="50" r="11" fill="#FFFFFF" stroke="#302044" strokeWidth="3.5" />
      {/* Bridge */}
      <path d="M48,50 L52,50" stroke="#302044" strokeWidth="3.5" strokeLinecap="round" />

      {/* Sleepy smart eyes inside glasses */}
      <path d="M32,52 Q37,45 42,52" fill="none" stroke="#302044" strokeWidth="3" strokeLinecap="round" />
      <path d="M58,52 Q63,45 68,52" fill="none" stroke="#302044" strokeWidth="3" strokeLinecap="round" />

      {/* Gentle mouth */}
      <path d="M47,68 Q50,72 53,68" fill="none" stroke="#302044" strokeWidth="2.5" strokeLinecap="round" />
      {/* Little cheek blush */}
      <circle cx="28" cy="58" r="4" fill="#C5AEFF" />
      <circle cx="72" cy="58" r="4" fill="#C5AEFF" />
    </svg>
  );
}

// -------------------------------------------------------------
// 4. PICKLE — The Sneaky Trickster (Mint Green Bean)
// -------------------------------------------------------------
function PickleSvg({ expression }: { expression: MascotExpression }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
      {/* Tiny sneaky feet */}
      <ellipse cx="40" cy="88" rx="7" ry="4" fill="#4FB38D" stroke="#302044" strokeWidth="3" />
      <ellipse cx="60" cy="88" rx="7" ry="4" fill="#4FB38D" stroke="#302044" strokeWidth="3" />

      {/* Bean Body */}
      <path
        d="M32,32 C26,50 30,76 46,84 C62,88 74,72 72,50 C70,28 64,14 48,16 C36,18 36,24 32,32 Z"
        fill="#70E6BB"
        stroke="#302044"
        strokeWidth="3.5"
      />

      {/* Shifty Eyes */}
      <ellipse cx="44" cy="42" rx="7" ry="9" fill="#FFFFFF" stroke="#302044" strokeWidth="2.5" />
      <ellipse cx="62" cy="40" rx="7" ry="9" fill="#FFFFFF" stroke="#302044" strokeWidth="2.5" />
      <circle cx="47" cy="43" r="3.5" fill="#302044" />
      <circle cx="65" cy="41" r="3.5" fill="#302044" />
      <circle cx="48" cy="41" r="1.2" fill="#FFFFFF" />
      <circle cx="66" cy="39" r="1.2" fill="#FFFFFF" />

      {/* Raised Sly Eyebrow */}
      <path d="M38,31 Q45,28 50,33" stroke="#302044" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M58,30 Q65,26 69,31" stroke="#302044" strokeWidth="2.5" strokeLinecap="round" />

      {/* Smirking mouth */}
      <path d="M45,58 Q54,64 63,54" fill="none" stroke="#302044" strokeWidth="3" strokeLinecap="round" />

      {/* Sneaky tiny arms */}
      <path d="M28,52 Q22,58 30,64" fill="none" stroke="#302044" strokeWidth="3" strokeLinecap="round" />
      <path d="M70,48 Q78,54 72,62" fill="none" stroke="#302044" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// -------------------------------------------------------------
// 5. BOOM — The Celebration Monster (Orange Fluffy)
// -------------------------------------------------------------
function BoomSvg({ expression }: { expression: MascotExpression }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
      {/* Tiny Horns */}
      <polygon points="32,24 26,8 38,18" fill="#FFD84D" stroke="#302044" strokeWidth="2.5" strokeLinejoin="round" />
      <polygon points="68,24 74,8 62,18" fill="#FFD84D" stroke="#302044" strokeWidth="2.5" strokeLinejoin="round" />

      {/* Big Fluffy Feet */}
      <ellipse cx="34" cy="90" rx="9" ry="5" fill="#D66018" stroke="#302044" strokeWidth="3" />
      <ellipse cx="66" cy="90" rx="9" ry="5" fill="#D66018" stroke="#302044" strokeWidth="3" />

      {/* Fluffy Round Body */}
      <path
        d="M22,50 C18,36 30,22 50,22 C70,22 82,36 78,50 C86,64 76,82 66,86 C54,88 46,88 34,86 C24,82 14,64 22,50 Z"
        fill="#FF8A3D"
        stroke="#302044"
        strokeWidth="3.5"
      />

      {/* Wide Happy Eyes */}
      <circle cx="38" cy="44" r="8.5" fill="#FFFFFF" stroke="#302044" strokeWidth="2.5" />
      <circle cx="62" cy="44" r="8.5" fill="#FFFFFF" stroke="#302044" strokeWidth="2.5" />
      <circle cx="38" cy="44" r="4.5" fill="#302044" />
      <circle cx="62" cy="44" r="4.5" fill="#302044" />
      <circle cx="40" cy="42" r="1.5" fill="#FFFFFF" />
      <circle cx="64" cy="42" r="1.5" fill="#FFFFFF" />

      {/* Huge Celebration Open Grin */}
      <path d="M34,56 Q50,78 66,56 Z" fill="#6A1A24" stroke="#302044" strokeWidth="2.5" />
      {/* Tongue */}
      <path d="M44,66 Q50,72 56,66 Q50,62 44,66 Z" fill="#FF5DA2" />

      {/* Tiny Cheerful Arms up! */}
      <path d="M18,48 Q10,38 16,32" fill="none" stroke="#302044" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M82,48 Q90,38 84,32" fill="none" stroke="#302044" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
