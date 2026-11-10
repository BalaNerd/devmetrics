import type { Metadata } from 'next';
import { Syne, Space_Grotesk, Inter, Space_Mono } from 'next/font/google';
import './globals.css';
import AppModals from '@/components/layout/AppModals';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DevMetrics — Executive Developer Intelligence & Repository Velocity',
  description:
    'Executive developer intelligence dashboard. Analyze repository velocity, health, contributor distribution, and code activity for any public GitHub repo.',
  keywords: ['github', 'metrics', 'developer', 'analytics', 'velocity', 'open source'],
  openGraph: {
    title: 'DevMetrics',
    description: 'GitHub Repository Intelligence Dashboard',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${spaceGrotesk.variable} ${inter.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen text-[#0C1222] antialiased">
        {children}
        <AppModals />
      </body>
    </html>
  );
}
