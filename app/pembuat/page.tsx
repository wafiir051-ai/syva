import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Code } from 'lucide-react';
import { CREATOR } from '@/lib/creator';
import BlurText from '@/components/reactbits/BlurText';
import ClickSpark from '@/components/reactbits/ClickSpark';
import ShinyText from '@/components/reactbits/ShinyText';
import SpotlightCard from '@/components/reactbits/SpotlightCard';

export const metadata: Metadata = {
  title: `Pembuat | SYVA Spatial Lab`,
  description: `${CREATOR.name}, pembuat SYVA Spatial Lab: lab belajar 3D interaktif untuk SMK IT As-Syifa.`,
};

const REPO_URL = 'https://github.com/wafiir051-ai/syva';

const TECH = [
  'Next.js 16',
  'React 19',
  'Tailwind CSS 4',
  'three.js + React Three Fiber',
  'MediaPipe (kendali tangan)',
  'Groq (AI SYVA)',
  'React Bits',
  'Vercel',
];

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow';

// Keeps the SYVA palette: the spotlight card's default black surface is overridden.
const SPOT_VARS = {
  '--spotlight-card-surface': '#3836a8',
  '--spotlight-card-border': 'rgba(85, 89, 217, 0.9)',
  '--spotlight-card-shadow': '0 24px 40px -28px rgba(10, 8, 60, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
} as CSSProperties;

export default function PembuatPage() {
  return (
    <ClickSpark sparkColor="#ff7a1f" sparkSize={12} sparkRadius={26} sparkCount={9} duration={450}>
      <div className="relative min-h-screen overflow-x-clip bg-ink bg-[radial-gradient(ellipse_70%_45%_at_30%_0%,#3633a6_0%,transparent_70%)] font-sans text-mist">
        <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <Link href="/" className={`rounded font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl ${focusRing}`}>
            <span className="relative inline-block">
              S
              <span aria-hidden className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-flame" />
            </span>
            YVA
          </Link>
          <Link
            href="/"
            className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 border-line px-4 text-sm font-semibold text-white transition-colors duration-200 hover:border-periwinkle ${focusRing}`}
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Beranda
          </Link>
        </header>

        <main className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            {/* photo on a circle stage, like the hero */}
            <div className="relative mx-auto aspect-square w-full max-w-[min(24rem,72vw)]">
              <div aria-hidden className="pointer-events-none absolute -inset-[9%] rounded-full border border-white/15" />
              <div aria-hidden className="pointer-events-none absolute -inset-[18%] rounded-full border border-dashed border-white/20" />
              <div className="absolute inset-0 overflow-hidden rounded-full border-4 border-white/20 bg-ink-deep shadow-[0_40px_70px_-30px_rgba(10,8,60,0.9),inset_0_2px_0_rgba(255,255,255,0.18)]">
                <Image
                  src={CREATOR.photo}
                  alt={`Foto ${CREATOR.name}, pembuat SYVA`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 384px, 72vw"
                  className="object-cover object-[50%_25%]"
                />
              </div>
            </div>

            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em]">
                <ShinyText text="Pembuat SYVA" color="#c4c0ff" shineColor="#ffffff" speed={3} />
              </p>
              <div role="heading" aria-level={1} className="mt-3">
                <BlurText
                  text={CREATOR.name}
                  delay={90}
                  animateBy="words"
                  direction="top"
                  className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
                />
              </div>
              <p className="mt-5 max-w-lg text-lg leading-relaxed">
                Pembuat SYVA Spatial Lab, lab belajar 3D interaktif untuk SMK IT As-Syifa.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/student"
                  className={`inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-flame px-7 font-bold text-ink-deep shadow-[0_14px_28px_-12px_rgba(255,122,31,0.8)] transition-colors duration-200 hover:bg-flame-hi ${focusRing}`}
                >
                  Coba Lab Siswa
                  <ArrowRight aria-hidden className="h-5 w-5" />
                </Link>
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-line px-6 font-semibold text-white transition-colors duration-200 hover:border-periwinkle ${focusRing}`}
                >
                  <Code aria-hidden className="h-5 w-5" />
                  Lihat kode sumber
                  <span className="sr-only"> (tab baru)</span>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-24 grid gap-6 md:grid-cols-2">
            <SpotlightCard className="p-6! sm:p-8!" style={SPOT_VARS} spotlightColor="#3fefff" intensity={0.1} spotlightSize={300}>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-lilac">Tentang proyek</p>
              <h2 className="mt-3 font-display text-2xl font-bold text-white">SYVA Spatial Lab</h2>
              <p className="mt-3 leading-relaxed">
                Siswa menjelajahi model materi dengan gerakan tangan dan asisten suara, langsung di browser tanpa headset VR. Guru
                menyiapkan materi dari Panel Guru, dan robot SYVA ikut menjawab pertanyaan.
              </p>
              <Link
                href="/teacher"
                className={`mt-5 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded font-semibold text-glow transition-colors hover:text-white ${focusRing}`}
              >
                Buka Panel Guru
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </SpotlightCard>

            <SpotlightCard className="p-6! sm:p-8!" style={SPOT_VARS} spotlightColor="#3fefff" intensity={0.1} spotlightSize={300}>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-lilac">Dibangun dengan</p>
              <h2 className="mt-3 font-display text-2xl font-bold text-white">Teknologi</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {TECH.map((t) => (
                  <li key={t} className="rounded-full border border-line bg-ink-deep px-3.5 py-1.5 text-sm text-mist">
                    {t}
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </div>
        </main>

        <footer className="border-t border-line/60">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>
              <span className="font-display font-bold text-white">SYVA</span> Spatial Lab · SMK IT As-Syifa
            </p>
            <Link href="/" className={`rounded font-mono text-xs text-periwinkle hover:text-white ${focusRing}`}>
              Kembali ke beranda
            </Link>
          </div>
        </footer>
      </div>
    </ClickSpark>
  );
}
