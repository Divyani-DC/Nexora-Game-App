import { Mascot, MascotId } from './ChaosCrew.tsx';

export interface AvatarOption {
  id: string;
  name: string;
  mascot: MascotId;
  bgClass: string;
  badgeColor: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'avatar-1',
    name: 'Pip',
    mascot: 'pip',
    bgClass: 'bg-[#FFE6F1] border-[#FF5DA2]',
    badgeColor: '#FF5DA2'
  },
  {
    id: 'avatar-2',
    name: 'Zap',
    mascot: 'zap',
    bgClass: 'bg-[#E2F7FF] border-[#53CFFF]',
    badgeColor: '#53CFFF'
  },
  {
    id: 'avatar-3',
    name: 'Mochi',
    mascot: 'mochi',
    bgClass: 'bg-[#EFE9FF] border-[#9B72FF]',
    badgeColor: '#9B72FF'
  },
  {
    id: 'avatar-4',
    name: 'Pickle',
    mascot: 'pickle',
    bgClass: 'bg-[#E2FAF1] border-[#70E6BB]',
    badgeColor: '#70E6BB'
  },
  {
    id: 'avatar-5',
    name: 'Boom',
    mascot: 'boom',
    bgClass: 'bg-[#FFF0E6] border-[#FF8A3D]',
    badgeColor: '#FF8A3D'
  },
  {
    id: 'avatar-6',
    name: 'Party Pip',
    mascot: 'pip',
    bgClass: 'bg-[#FFF0B8] border-[#FFD84D]',
    badgeColor: '#FFD84D'
  },
  {
    id: 'avatar-7',
    name: 'Sly Pickle',
    mascot: 'pickle',
    bgClass: 'bg-[#FFE6F1] border-[#FF5DA2]',
    badgeColor: '#FF5DA2'
  },
  {
    id: 'avatar-8',
    name: 'Turbo Zap',
    mascot: 'zap',
    bgClass: 'bg-[#EFE9FF] border-[#9B72FF]',
    badgeColor: '#9B72FF'
  }
];

export function AvatarDisplay({
  avatarId,
  size = 'md',
  showBorder = true,
  className = ''
}: {
  avatarId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBorder?: boolean;
  className?: string;
}) {
  const opt = AVATAR_OPTIONS.find(a => a.id === avatarId) || AVATAR_OPTIONS[0];

  const sizeClasses = {
    xs: 'w-7 h-7 p-0.5',
    sm: 'w-10 h-10 p-1',
    md: 'w-13 h-13 p-1.5',
    lg: 'w-18 h-18 p-2',
    xl: 'w-24 h-24 p-2.5'
  };

  const mascotSizes = {
    xs: 'xs' as const,
    sm: 'sm' as const,
    md: 'sm' as const,
    lg: 'md' as const,
    xl: 'lg' as const
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl ${opt.bgClass} ${
        showBorder ? 'border-3 border-[#302044] shadow-[2px_3px_0px_#302044]' : ''
      } ${sizeClasses[size]} ${className}`}
      title={opt.name}
    >
      <Mascot character={opt.mascot} size={mascotSizes[size]} />
    </div>
  );
}
