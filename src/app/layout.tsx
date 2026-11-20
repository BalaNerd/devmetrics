import type { Metadata } from 'next';
import { Instrument_Serif, Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import AppModals from '@/components/layout/AppModals';
import { Analytics } from '@vercel/analytics/next';

const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
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
      className={`${instrumentSerif.variable} ${inter.variable} ${ibmPlexMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[#120909] text-[#E8D2B5] font-sans antialiased">
        {children}
        <Analytics />
        <AppModals />
      </body>
    </html>
  );
}
