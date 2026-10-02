import type { Metadata } from 'next';
import { Instrument_Sans, Montserrat } from 'next/font/google';
import './globals.css';

// Montserrat matches the logo's bold/light wordmark; used sparingly for display type.
const montserrat = Montserrat({ subsets: ['latin'], weight: ['300', '700', '800'], variable: '--font-montserrat' });
const instrumentSans = Instrument_Sans({ subsets: ['latin'], variable: '--font-instrument-sans' });

export const metadata: Metadata = {
  title: 'MuseMeter',
  description: 'Find live music and events near you.',
  icons: {
    icon: [
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/favicon/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${instrumentSans.variable}`}>
      <body className="bg-white text-surface-900 dark:bg-surface-950 dark:text-surface-50">{children}</body>
    </html>
  );
}
