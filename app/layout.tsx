import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Baloo_2, Geist, Geist_Mono } from 'next/font/google';

const baloo = Baloo_2({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-baloo' });
const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: 'SYVA Spatial Lab | SMK IT As-Syifa',
  description:
    'Lab belajar 3D interaktif: jelajahi model materi dengan gerakan tangan dan asisten suara SYVA.',
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
