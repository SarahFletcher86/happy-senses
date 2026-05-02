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
        'calm-teal': '#5BB8B7',
        'warm-mustard': '#E5B962',
        'soft-peach': '#F4A892',
        'gentle-green': '#A8D8A8',
        'light-sky-blue': '#B8DDE8',
        charcoal: '#2C3338',
        'mid-gray': '#8E97A3',
        cream: '#FFFCF7',
        'light-cream': '#FBF8F2',
        'dark-bg': '#1A1F23',
        'dark-surface': '#242A30',
        'dark-text': '#E8E4DD',
        'dark-text-soft': '#95A0AA',
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
