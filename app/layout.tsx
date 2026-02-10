import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/app/components/theme-provider';

export const metadata: Metadata = {
  title: 'Happy Senses',
  description: 'A directory of sensory-friendly venues and experiences.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Quicksand:wght@400;500;700&family=Pacifico&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
