// components/SyvaHUD.tsx
'use client';

import Link from 'next/link';
import { ArrowLeft, Presentation } from 'lucide-react';

interface SyvaHUDProps {
  title?: string;
  description?: string;
}

const linkClass =
  'pointer-events-auto inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line px-3.5 text-sm font-semibold text-mist transition-colors duration-200 hover:border-periwinkle hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow';

/** Info card for the module being shown. Sits beside the voice assistant on large screens, below it on small ones. */
export default function SyvaHUD({
  title = 'Materi Pembelajaran',
  description = 'Simulasi interaktif 3D',
}: SyvaHUDProps) {
  return (
    <header className="pointer-events-none fixed inset-x-4 top-[5.5rem] z-30 font-sans lg:left-[26.5rem] lg:top-4">
      <div className="flex items-center justify-between gap-4 rounded-3xl border border-line bg-ink-deep px-4 py-3 shadow-[0_20px_40px_-24px_rgba(10,8,60,0.9),inset_0_1px_0_rgba(255,255,255,0.07)] sm:px-5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-glow">
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-glow" />
            <span className="truncate">Lab Siswa</span>
          </p>
          <h1 className="mt-1 truncate font-display text-lg font-bold leading-tight text-white sm:text-xl">{title}</h1>
          <p className="mt-0.5 hidden max-w-xl truncate text-sm text-mist sm:block">{description}</p>
        </div>

        <nav aria-label="Navigasi lab" className="hidden shrink-0 items-center gap-2 md:flex">
          <Link href="/" className={linkClass}>
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Beranda
          </Link>
          <Link href="/teacher" className={linkClass}>
            <Presentation aria-hidden className="h-4 w-4" />
            Panel Guru
          </Link>
        </nav>
      </div>
    </header>
  );
}
