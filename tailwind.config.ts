import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        'calm-teal': 'var(--calm-teal)',
        'calm-teal-deep': 'var(--calm-teal-deep)',
        'warm-mustard': 'var(--warm-mustard)',
        'soft-peach': 'var(--soft-peach)',
        'gentle-green': 'var(--gentle-green)',
        'light-sky-blue': 'var(--light-sky-blue)',
        charcoal: 'var(--charcoal)',
        'mid-gray': 'var(--mid-gray)',
        cream: 'var(--cream)',
        'light-cream': 'var(--light-cream)',
        'border-subtle': 'var(--border-subtle)',
        'dark-bg': 'var(--dark-bg)',
        'dark-card': 'var(--dark-card)',
        'dark-border': 'var(--dark-border)',
        'dark-cta-teal': 'var(--dark-cta-teal)',
        'dark-text-primary': 'var(--dark-text-primary)',
        'dark-text-heading': 'var(--dark-text-heading)',
        'dark-text-muted': 'var(--dark-text-muted)',
        'dark-text-dim': 'var(--dark-text-dim)',
        'dark-surface': 'var(--dark-card)',
        'dark-text': 'var(--dark-text-primary)',
        'dark-text-soft': 'var(--dark-text-muted)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1.25rem',
      },
      fontFamily: {
        sans: ['var(--font-quicksand)', 'Trebuchet MS', 'Arial', 'sans-serif'],
        'easier-reading': ['var(--font-lexend)', 'Trebuchet MS', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: '0 18px 40px -28px rgba(44, 51, 56, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
