'use client';

import { cn } from '@/lib/utils';
import type { EquipmentHeight } from '@/lib/types';

// Inline SVG icons to avoid dependency issues
const Icons = {
  Accessible: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="4.5" r="2.5" />
      <path d="m10.2 6.3-3.9 3.9" />
      <circle cx="4.5" cy="9.5" r="2.5" />
      <path d="m13.8 6.3 3.9 3.9" />
      <circle cx="19.5" cy="9.5" r="2.5" />
      <path d="m5.5 17 4 4" />
      <circle cx="17.5" cy="14.5" r="2.5" />
      <path d="m15.5 17-4 4" />
      <circle cx="7.5" cy="14.5" r="2.5" />
      <path d="m10.2 17 3.6 3.6" />
      <path d="m12 21 1.5-1.5" />
    </svg>
  ),
  Fenced: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 21V8" />
      <path d="M20 21V8" />
      <path d="M1 21h22" />
      <path d="M4 21V14" />
      <path d="M20 21V14" />
      <path d="M7 21V11" />
      <path d="M17 21V11" />
      <path d="M10 21V3" />
      <path d="M14 21V3" />
    </svg>
  ),
  Water: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 12c6.667-8 13.333 8 20 0" />
      <path d="M12 3v1" />
      <path d="M4.22 4.22l.71.71" />
      <path d="M18.36 18.36l.71.71" />
      <path d="M2 12v1" />
      <path d="M22 12v1" />
      <path d="M4.22 19.78l.71-.71" />
      <path d="M18.36 5.64l.71-.71" />
    </svg>
  ),
  Ruler: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21.2 15c.7 0 1.3-.5 1.3-1.2 0-.6-.4-1.1-1-1.2L12 2 2.5 12.6c-.6.1-1 .6-1 1.2 0 .7.6 1.2 1.3 1.2h18.4z" />
      <path d="M12 2v20" />
      <path d="M2 8.2h20" />
      <path d="M2 15.8h20" />
    </svg>
  ),
  Alert: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  ),
  Check: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
};

interface SafetyBadgeProps {
  type: 'accessible' | 'fenced' | 'near_water' | 'equipment_height';
  value: boolean | null | undefined;
  heightValue?: EquipmentHeight;
  className?: string;
}

export function SafetyBadge({ type, value, heightValue, className }: SafetyBadgeProps) {
  const config = {
    accessible: {
      icon: Icons.Accessible,
      label: 'Accessible',
      availableColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      unavailableColor: 'bg-gray-50 text-gray-400 border-gray-200',
    },
    fenced: {
      icon: Icons.Fenced,
      label: 'Fenced',
      availableColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      unavailableColor: 'bg-gray-50 text-gray-400 border-gray-200',
    },
    near_water: {
      icon: Icons.Water,
      label: 'Near Water',
      availableColor: 'bg-amber-100 text-amber-700 border-amber-200',
      unavailableColor: 'bg-gray-50 text-gray-400 border-gray-200',
    },
    equipment_height: {
      icon: Icons.Ruler,
      label: 'Equipment Height',
      colors: {
        toddler: 'bg-blue-100 text-blue-700 border-blue-200',
        low: 'bg-blue-100 text-blue-700 border-blue-200',
        medium: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        high: 'bg-purple-100 text-purple-700 border-purple-200',
        various: 'bg-gradient-to-r from-blue-100 to-purple-100 text-indigo-700 border-indigo-200',
      },
    },
  };

  if (type === 'equipment_height') {
    const { icon: Icon, label, colors } = config.equipment_height;
    const color = colors[heightValue || 'various'] || colors['various'];
    
    return (
      <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', color, className)}>
        <Icon className="w-3.5 h-3.5" />
        <span>{label}:</span>
        <span className="capitalize">{heightValue || 'Various'}</span>
      </div>
    );
  }

  const { icon: Icon, label, availableColor, unavailableColor } = config[type];
  const color = value === true ? availableColor : unavailableColor;

  return (
    <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', color, className)}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
      {value === true && <Icons.Check className="w-3 h-3 ml-0.5" />}
    </div>
  );
}

interface WarningBadgeProps {
  message: string;
  className?: string;
}

export function WarningBadge({ message, className }: WarningBadgeProps) {
  return (
    <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs', className)}>
      <Icons.Alert className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}
