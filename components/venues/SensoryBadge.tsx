'use client';

import { MoonStar, SunMedium, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDisplaySensoryValue, getSensoryLevelLabel } from '@/lib/sensory-utils';

interface SensoryBadgeProps {
  type: 'noise' | 'light' | 'crowd';
  value: number | null;
  showLabel?: boolean;
  className?: string;
}

const sensoryConfig = {
  noise: { icon: MoonStar, label: 'Quiet', emoji: '🤫' },
  light: { icon: SunMedium, label: 'Calm light', emoji: '💡' },
  crowd: { icon: Users, label: 'Low crowd', emoji: '👥' },
} as const;

function toneForValue(value: number | null) {
  if (value === null) return 'bg-light-cream text-mid-gray dark:bg-dark-bg dark:text-dark-text-soft';
  const display = getDisplaySensoryValue(value);
  if (display !== null && display >= 4) {
    return 'bg-[rgba(168,216,168,0.25)] text-[#3F7A3F] dark:bg-[rgba(168,216,168,0.12)] dark:text-[#B5DCB5]';
  }
  if (display === 3) {
    return 'bg-[rgba(229,185,98,0.22)] text-[#8A631E] dark:bg-[rgba(229,185,98,0.12)] dark:text-[#F2D08B]';
  }
  return 'bg-[rgba(244,168,146,0.24)] text-[#B25938] dark:bg-[rgba(244,168,146,0.12)] dark:text-[#F8C4B0]';
}

export function SensoryBadge({ type, value, showLabel = true, className }: SensoryBadgeProps) {
  const config = sensoryConfig[type];
  const Icon = config.icon;
  const display = getDisplaySensoryValue(value);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold',
        toneForValue(value),
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{config.emoji}</span>
      {showLabel ? <span>{config.label}</span> : null}
      <span>{display !== null ? `${display}/5` : '?'}</span>
      {showLabel && value !== null ? <span className="opacity-80">{getSensoryLevelLabel(value)}</span> : null}
    </div>
  );
}

interface SensoryPillProps {
  type: 'quiet_room' | 'headphones' | 'staff_trained' | 'certified';
  available: boolean | null;
  className?: string;
}

const pillConfig = {
  quiet_room: { emoji: '🤫', label: 'Quiet room' },
  headphones: { emoji: '🎧', label: 'Headphones' },
  staff_trained: { emoji: '👋', label: 'Staff trained' },
  certified: { emoji: '✓', label: 'Certified' },
} as const;

export function SensoryPill({ type, available, className }: SensoryPillProps) {
  const { emoji, label } = pillConfig[type];
  const active = type === 'certified' ? true : available === true;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold',
        active
          ? 'border-[rgba(91,184,183,0.25)] bg-[rgba(91,184,183,0.10)] text-[#2F7372] dark:border-[rgba(91,184,183,0.30)] dark:bg-[rgba(91,184,183,0.14)] dark:text-[#A3DEDD]'
          : 'border-[rgba(91,184,183,0.18)] bg-[rgba(91,184,183,0.06)] text-[#5A8E8D] dark:border-[rgba(91,184,183,0.18)] dark:bg-[rgba(91,184,183,0.10)] dark:text-[#7FB9B8]',
        className
      )}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </div>
  );
}
