import type { Metadata } from 'next';
import { Syne, Space_Grotesk, Inter, Space_Mono } from 'next/font/google';
import './globals.css';
import AppModals from '@/components/layout/AppModals';
import { Analytics } from '@vercel/analytics/next';

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
  title: 'DevMetrics — Engineering Telemetry Cockpit',
  description: 'Executive developer intelligence and repository velocity dashboard',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  keywords: ['github', 'metrics', 'developer', 'analytics', 'velocity', 'open source'],
  openGraph: {
    title: 'DevMetrics — Engineering Telemetry Cockpit',
    description: 'Executive developer intelligence and repository velocity dashboard',
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
      className={`${syne.variable} ${spaceGrotesk.variable} ${inter.variable} ${spaceMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[#120909] text-[#E8D2B5] antialiased">
        {children}
        <Analytics />
        <AppModals />
      </body>
    </html>
  );
}
