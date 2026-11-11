'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

import { CREATOR } from '@/lib/creator';

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow';
const thinLink = `cursor-pointer rounded py-3 text-sm font-medium text-white/90 underline decoration-transparent decoration-2 underline-offset-[10px] transition-colors duration-200 hover:text-white hover:decoration-flame ${focusRing}`;

const MAIN_LINKS = [
  { href: '#fitur', label: 'Fitur' },
  { href: '#mapel', label: 'Mata Pelajaran' },
  { href: '#cara-kerja', label: 'Cara Kerja' },
];

/** Transparent navbar laid over the hero backdrop. */
export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <nav aria-label="Utama" className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-20 lg:gap-14 lg:px-10">
        <Link href="/" className={`rounded font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl ${focusRing}`}>
          <span className="relative inline-block">
            S
            <span aria-hidden className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-flame" />
          </span>
          YVA
        </Link>

        <ul className="hidden items-center gap-8 md:flex lg:gap-10">
          {MAIN_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className={thinLink}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-3 sm:gap-6">
          <Link href="/teacher" className={`hidden sm:inline-block ${thinLink}`}>
            Panel Guru
          </Link>
          <Link
            href="/student"
            className={`inline-flex min-h-11 cursor-pointer items-center rounded-full bg-flame px-5 text-sm font-bold text-ink-deep shadow-[0_8px_20px_-8px_rgba(255,122,31,0.7)] transition-colors duration-200 hover:bg-flame-hi ${focusRing}`}
          >
            Masuk Lab
          </Link>
          <Link
            href="/pembuat"
            aria-label={`Tentang pembuat: ${CREATOR.name}`}
            className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 border-line pl-0.5 pr-0.5 text-sm font-semibold text-white transition-colors duration-200 hover:border-periwinkle sm:pr-4 ${focusRing}`}
          >
            <Image
              src={CREATOR.avatar}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-full object-cover object-[50%_25%]"
            />
            <span className="hidden sm:inline">Pembuat</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-white md:hidden ${focusRing}`}
          >
            {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="menu-mobile" className="mx-4 rounded-2xl border border-line bg-ink-deep p-2 md:hidden">
          <ul>
            {MAIN_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-11 cursor-pointer items-center rounded-xl px-4 font-medium text-white hover:bg-surface ${focusRing}`}
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/teacher"
                onClick={() => setOpen(false)}
                className={`flex min-h-11 cursor-pointer items-center rounded-xl px-4 font-medium text-white hover:bg-surface ${focusRing}`}
              >
                Panel Guru
              </Link>
            </li>
          </ul>
          <Link
            href="/pembuat"
            onClick={() => setOpen(false)}
            className={`mt-1 flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-t border-line/60 px-4 pt-2 font-medium text-white hover:bg-surface ${focusRing}`}
          >
            <Image src={CREATOR.avatar} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover object-[50%_25%]" />
            Pembuat: {CREATOR.name}
          </Link>
        </div>
      )}
    </header>
  );
}
