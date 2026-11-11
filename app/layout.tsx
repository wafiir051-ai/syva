import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Baloo_2, Geist, Geist_Mono } from 'next/font/google';

const baloo = Baloo_2({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-baloo' });
const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

const TITLE = 'SYVA Spatial Lab | Lab Belajar 3D Interaktif';
const DESCRIPTION =
  'Lab belajar 3D interaktif: putar dan jelajahi model materi dengan gerakan tangan dan suara, langsung di browser tanpa headset VR. Ada robot AI SYVA yang siap membantu.';

// Links in the preview (Telegram, WhatsApp, Google) must be absolute. Vercel provides the
// production domain at build time, so each deployment points at its own address.
const SITE_URL = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? 'localhost:3000'}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: 'SYVA Spatial Lab',
    type: 'website',
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: '#2a2788',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${baloo.variable} ${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased bg-ink">{children}</body>
    </html>
  );
}
