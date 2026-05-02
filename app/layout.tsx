import type { Metadata } from 'next';
import { Lexend, Quicksand } from 'next/font/google';
import './globals.css';

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-quicksand',
});

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-lexend',
});

const themeInitScript = `
  (function () {
    try {
      var theme = localStorage.getItem('theme');
      var readingMode = localStorage.getItem('reading-mode');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (theme === 'dark' || (!theme && prefersDark)) {
        document.documentElement.classList.add('dark');
      }
      if (readingMode === 'easier') {
        document.body.classList.add('easier-reading');
      }
    } catch (error) {
      console.warn('Failed to initialize accessibility preferences.', error);
    }
  })();
`;

export const metadata: Metadata = {
  title: 'Happy Senses',
  description: 'Sensory-friendly spaces for everyone.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${quicksand.variable} ${lexend.variable}`}>
      <body className="bg-cream font-sans text-charcoal antialiased dark:bg-dark-bg dark:text-dark-text">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
