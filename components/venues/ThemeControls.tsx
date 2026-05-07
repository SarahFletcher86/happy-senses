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
          'inline-flex items-center gap-1.5 rounded-[10px] border px-[18px] py-[9px] text-[13px] font-semibold',
          isEasierReading
            ? 'border-calm-teal bg-calm-teal text-white'
            : 'border-border-subtle bg-white text-charcoal hover:border-calm-teal hover:text-calm-teal dark:border-white/12 dark:bg-white/6 dark:text-dark-text-primary dark:hover:border-dark-cta-teal dark:hover:text-dark-cta-teal'
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
          'inline-flex items-center gap-1.5 rounded-[10px] border px-[18px] py-[9px] text-[13px] font-semibold',
          isDark
            ? 'border-dark-cta-teal bg-dark-cta-teal text-[#14201F] shadow-[0_2px_8px_rgba(111,207,206,0.3)] hover:bg-[#8FE0DF]'
            : 'border-border-subtle bg-white text-charcoal hover:border-calm-teal hover:text-calm-teal dark:border-white/12 dark:bg-white/6 dark:text-dark-text-primary dark:hover:border-dark-cta-teal dark:hover:text-dark-cta-teal'
        )}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        {isDark ? 'Light mode' : 'Dark mode'}
      </button>
    </div>
  );
}
