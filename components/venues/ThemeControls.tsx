'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeControls() {
  const [isDark, setIsDark] = useState(false);
  const [isEasierReading, setIsEasierReading] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    setIsEasierReading(document.body.classList.contains('easier-reading'));
  }, []);

  const toggleDarkMode = () => {
    const nextValue = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', nextValue);
    localStorage.setItem('theme', nextValue ? 'dark' : 'light');
    setIsDark(nextValue);
  };

  const toggleReadingMode = () => {
    const nextValue = !document.body.classList.contains('easier-reading');
    document.body.classList.toggle('easier-reading', nextValue);
    localStorage.setItem('reading-mode', nextValue ? 'easier' : 'standard');
    setIsEasierReading(nextValue);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={toggleReadingMode}
        aria-pressed={isEasierReading}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold',
          isEasierReading
            ? 'border-calm-teal bg-calm-teal text-white'
            : 'border-[rgba(44,51,56,0.12)] bg-white/70 text-charcoal hover:border-calm-teal dark:border-white/10 dark:bg-dark-surface dark:text-dark-text'
        )}
      >
        <Type className="h-4 w-4" />
        Aa Easier reading
      </button>
      <button
        type="button"
        onClick={toggleDarkMode}
        aria-pressed={isDark}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold',
          isDark
            ? 'border-warm-mustard bg-warm-mustard text-charcoal'
            : 'border-[rgba(44,51,56,0.12)] bg-white/70 text-charcoal hover:border-warm-mustard dark:border-white/10 dark:bg-dark-surface dark:text-dark-text'
        )}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        {isDark ? 'Light mode' : 'Dark mode'}
      </button>
    </div>
  );
}
