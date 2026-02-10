'use client';

import { Volume2, Sun, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSensoryLevelLabel } from '@/lib/sensory-utils';

interface SensoryBadgeProps {
  type: 'noise' | 'light' | 'crowd';
  value: number | null;
  showLabel?: boolean;
  className?: string;
}

export function SensoryBadge({ type, value, showLabel = true, className }: SensoryBadgeProps) {
  const Icon = type === 'noise' ? Volume2 : type === 'light' ? Sun : Users;
  const label = type === 'noise' ? 'Noise' : type === 'light' ? 'Light' : 'Crowd';
  
  const getColorClass = () => {
    if (value === null) return 'bg-gray-100 text-gray-500';
    if (value <= 2) return 'bg-emerald-100 text-emerald-700';
    if (value === 3) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };
  
  return (
    <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium', getColorClass(), className)}>
      <Icon className="w-3.5 h-3.5" />
      {showLabel && <span>{label}:</span>}
      <span>{value !== null ? `${value}/5` : '?'}</span>
      {showLabel && value !== null && (
        <span className="text-xs opacity-75">({getSensoryLevelLabel(value)})</span>
      )}
    </div>
  );
}

interface SensoryPillProps {
  type: 'quiet_room' | 'headphones' | 'staff_trained' | 'certified';
  available: boolean | null;
  className?: string;
}

// SVG icons inline for reliability
const HeadphonesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

const ShieldIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const Icons: Record<string, React.ElementType> = {
  quiet_room: Volume2,
  headphones: HeadphonesIcon,
  staff_trained: Users,
  certified: ShieldIcon,
};

const Labels: Record<string, string> = {
  quiet_room: 'Quiet Room',
  headphones: 'Headphones',
  staff_trained: 'Staff Trained',
  certified: 'Certified',
};

const Colors: Record<string, (available: boolean | null) => string> = {
  quiet_room: (available) => available ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-gray-50 text-gray-400 border-gray-200',
  headphones: (available) => available ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-gray-50 text-gray-400 border-gray-200',
  staff_trained: (available) => available ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-400 border-gray-200',
  certified: () => 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export function SensoryPill({ type, available, className }: SensoryPillProps) {
  const Icon = Icons[type];
  const label = Labels[type];
  const color = Colors[type](available);
  
  return (
    <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', color, className)}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
  );
}
