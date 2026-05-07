'use client';

import { Accessibility, ShieldCheck, Waves, Ruler, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EquipmentHeight } from '@/lib/types';

interface SafetyBadgeProps {
  type: 'accessible' | 'fenced' | 'near_water' | 'equipment_height';
  value?: boolean | null;
  heightValue?: EquipmentHeight;
  className?: string;
}

const config = {
  accessible: { icon: Accessibility, emoji: '♿', label: 'Accessible' },
  fenced: { icon: ShieldCheck, emoji: '🚧', label: 'Fenced' },
  near_water: { icon: Waves, emoji: '🌊', label: 'Near water' },
  equipment_height: { icon: Ruler, emoji: '📏', label: 'Equipment height' },
} as const;

export function SafetyBadge({ type, value, heightValue, className }: SafetyBadgeProps) {
  const item = config[type];
  const Icon = item.icon;
  const active = type === 'equipment_height' ? Boolean(heightValue) : value === true;
  const label = type === 'equipment_height' ? `${item.label}: ${heightValue ?? 'Various'}` : item.label;

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
      <Icon className="h-3.5 w-3.5" />
      <span>{item.emoji}</span>
      <span>{label}</span>
    </div>
  );
}

export function WarningBadge({ message, className }: { message: string; className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-2xl border border-[rgba(244,168,146,0.28)] bg-[rgba(244,168,146,0.18)] px-4 py-2 text-sm font-medium text-[#B25938] dark:border-[rgba(244,168,146,0.2)] dark:bg-[rgba(244,168,146,0.12)] dark:text-[#F8C4B0]',
        className
      )}
    >
      <TriangleAlert className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}
