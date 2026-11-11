import { Fragment, type ReactNode } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  AudioLines,
  Box,
  Cpu,
  Grid3x3,
  Hand,
  HeartPulse,
  Landmark,
  Orbit,
  Upload,
  Webcam,
} from 'lucide-react';
import type { SubjectCategory } from '@/types/syva';
import { SUBJECT_LABELS, SUBJECT_ORDER, SUBJECT_PRESETS } from '@/lib/presets';
import Hero, { Sparkle } from '@/components/landing/Hero';
import LabMock from '@/components/landing/LabMock';
import RobotChat from '@/components/landing/RobotChat';
import { MotionProvider, Reveal } from '@/components/landing/Reveal';
import ScrollModel from '@/components/landing/ScrollModel';
import SiteHeader from '@/components/landing/SiteHeader';
import StepsTimeline from '@/components/landing/StepsTimeline';
import BlurText from '@/components/reactbits/BlurText';
import ClickSpark from '@/components/reactbits/ClickSpark';
import CountUp from '@/components/reactbits/CountUp';
import Magnet from '@/components/reactbits/Magnet';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import ScrollVelocity from '@/components/reactbits/ScrollVelocity';
import TiltedCard, { TiltedCardLayer } from '@/components/reactbits/TiltedCard';

const SUBJECT_ICONS: Record<SubjectCategory, LucideIcon> = {
  TKJ_IT: Cpu,
  BIOLOGI: HeartPulse,
  FISIKA: Orbit,
  MATEMATIKA: Grid3x3,
  SEJARAH: Landmark,
  UMUM: Box,
};

const STATS: ReactNode[] = [
  <>
    <CountUp to={5} duration={1.2} /> mata pelajaran
  </>,
  'Tanpa headset VR',
  'Berjalan di browser',
];

// Keeps the SYVA palette: the spotlight card's default black surface is overridden.
const SPOT_VARS = {
  '--spotlight-card-surface': '#3836a8',
  '--spotlight-card-border': 'rgba(85, 89, 217, 0.9)',
  '--spotlight-card-shadow': '0 24px 40px -28px rgba(10, 8, 60, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
} as React.CSSProperties;

const STEPS = [
  {
    title: 'Guru menyiapkan materi',
    body: 'Pilih mata pelajaran, sesuaikan judul dan naskah penjelasan, atau unggah model .glb.',
    cta: { href: '/teacher', label: 'Buka Panel Guru' },
  },
  {
    title: 'Materi dikirim ke lab',
    body: 'Satu klik “Simpan & Tampilkan” membuka materi di Lab Siswa pada perangkat yang sama.',
  },
  {
    title: 'Siswa menjelajah',
    body: 'Izinkan kamera dan mikrofon, lalu putar, perbesar, dan tanyakan apa saja pada SYVA.',
    cta: { href: '/student', label: 'Masuk Lab Siswa' },
  },
];

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow';
const primaryBtn = `inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-flame px-7 font-bold text-ink-deep shadow-[0_14px_28px_-12px_rgba(255,122,31,0.8)] transition-colors duration-200 hover:bg-flame-hi ${focusRing}`;
const secondaryBtn = `inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-line px-7 font-semibold text-white transition-colors duration-200 hover:border-periwinkle ${focusRing}`;
const card =
  'rounded-3xl border border-line bg-surface p-6 shadow-[0_24px_40px_-28px_rgba(10,8,60,0.9),inset_0_1px_0_rgba(255,255,255,0.07)] transition-colors duration-200 hover:border-periwinkle';

const SPARKLE_PATH = 'M12 2c0 6 4 10 10 10-6 0-10 4-10 10 0-6-4-10-10-10 6 0 10-4 10-10Z';

/** One run of the marquee: every subject name, a sparkle between each. */
const MARQUEE_ROW = (
  <Fragment key="subjects">
    {SUBJECT_ORDER.map((cat) => (
      <span key={cat}>
        {SUBJECT_LABELS[cat]}
        <svg aria-hidden viewBox="0 0 24 24" className="mx-8 inline-block h-6 w-6 text-flame">
          <path d={SPARKLE_PATH} fill="currentColor" />
        </svg>
      </span>
    ))}
  </Fragment>
);

function SectionHead({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-lilac">{eyebrow}</p>
      <div id={id} role="heading" aria-level={2} className="mt-3">
        <BlurText
          text={title}
          delay={70}
          animateBy="words"
          direction="top"
          className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl"
        />
      </div>
      {children && <p className="mt-4 text-lg leading-relaxed">{children}</p>}
    </div>
  );
}

function IconBadge({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-flame text-ink-deep transition-transform duration-300 group-hover:-rotate-6">
      <Icon aria-hidden className="h-5 w-5" />
    </span>
  );
}

export default function LandingPage() {
  return (
    <MotionProvider>
      <ClickSpark sparkColor="#ff7a1f" sparkSize={12} sparkRadius={26} sparkCount={9} duration={450}>
      <div className="relative min-h-screen overflow-x-clip bg-ink bg-[radial-gradient(ellipse_70%_55%_at_60%_25%,#3633a6_0%,transparent_70%)] font-sans text-mist">
        <a
          href="#konten"
          className={`sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-flame focus:px-4 focus:py-2 focus:font-semibold focus:text-ink-deep ${focusRing}`}
        >
          Lewati ke konten
        </a>

        <SiteHeader />
        <RobotChat />

        <main id="konten" className="relative">
          <Hero />

          {/* SUBJECT BAND: a marquee that speeds up with the scroll (static list with reduced motion) */}
          <div className="border-y border-line/60 bg-ink-deep py-5">
            <div aria-hidden className="motion-reduce:hidden">
              <ScrollVelocity
                texts={[MARQUEE_ROW]}
                velocity={45}
                className="font-display"
                fontSize="clamp(1.75rem, 4vw, 3rem)"
                fontWeight={800}
                color="#cbceff"
                fadeEdges
                skewWithVelocity={4}
                separator={null}
              />
            </div>
            <ul className="hidden flex-wrap justify-center gap-x-6 gap-y-2 px-4 font-display text-2xl font-bold text-mist motion-reduce:flex">
              {SUBJECT_ORDER.map((cat) => (
                <li key={cat}>{SUBJECT_LABELS[cat]}</li>
              ))}
            </ul>
          </div>

          {/* FEATURES: bento */}
          <section id="fitur" aria-labelledby="fitur-title" className="scroll-mt-20">
            <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
              <SectionHead id="fitur-title" eyebrow="Fitur" title="Materi yang bisa dipegang">
                Semua berjalan di browser. Tidak perlu headset VR, cukup kamera laptop.
              </SectionHead>

              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Ringkasan">
                {STATS.map((s, i) => (
                  <li key={i} className="rounded-full border border-line bg-surface px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-mist">
                    {s}
                  </li>
                ))}
              </ul>

              <ul className="mt-12 grid gap-4 lg:grid-cols-3 lg:grid-rows-[auto_auto_auto]">
                <Reveal as="li" hover className="group lg:col-span-2 lg:row-span-2">
                  <SpotlightCard className="flex h-full flex-col p-6!" style={SPOT_VARS} spotlightColor="#3fefff" intensity={0.1} spotlightSize={320}>
                  <IconBadge icon={Hand} />
                  <h3 className="mt-5 font-display text-2xl font-bold text-white">Kendali gerakan tangan</h3>
                  <p className="mt-2 max-w-xl leading-relaxed">
                    Buka lima jari untuk memutar model, tunjuk dengan 1–4 jari untuk memilih penanda, dan rentangkan dua tangan untuk memperbesar.
                  </p>
                  <div className="mt-6 flex-1">
                    <LabMock />
                  </div>
                  </SpotlightCard>
                </Reveal>

                <Reveal as="li" index={1} hover className="group">
                  <SpotlightCard className="h-full p-6!" style={SPOT_VARS} spotlightColor="#3fefff" intensity={0.1}>
                  <IconBadge icon={AudioLines} />
                  <h3 className="mt-5 font-display text-xl font-bold text-white">Asisten suara SYVA</h3>
                  <p className="mt-2 leading-relaxed">
                    Ucapkan “Oke SYVA, jelaskan materi” dan penjelasan dari guru dibacakan langsung, termasuk detail bagian yang dipilih.
                  </p>
                  </SpotlightCard>
                </Reveal>

                <Reveal as="li" index={2} hover className="group">
                  <SpotlightCard className="h-full p-6!" style={SPOT_VARS} spotlightColor="#3fefff" intensity={0.1}>
                  <IconBadge icon={Box} />
                  <h3 className="mt-5 font-display text-xl font-bold text-white">Tanya apa saja ke SYVA</h3>
                  <p className="mt-2 leading-relaxed">
                    Robot maskot bisa diajak ngobrol dengan AI. Ketik pertanyaan, dan SYVA menjawab dalam Bahasa Indonesia.
                  </p>
                  </SpotlightCard>
                </Reveal>

                <Reveal as="li" index={3} hover className="group lg:col-span-3">
                  <SpotlightCard className="flex flex-col gap-5 p-6! sm:flex-row sm:items-center" style={SPOT_VARS} spotlightColor="#3fefff" intensity={0.1}>
                  <IconBadge icon={Upload} />
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-bold text-white">Model milik guru</h3>
                    <p className="mt-1 leading-relaxed">
                      Punya model sendiri? Unggah file .glb di Panel Guru dan materi apa pun bisa tampil di lab.
                    </p>
                  </div>
                  <Link
                    href="/teacher"
                    className={`inline-flex min-h-11 cursor-pointer items-center gap-2 self-start rounded-full border-2 border-line px-5 font-semibold text-white transition-colors duration-200 hover:border-flame sm:self-auto ${focusRing}`}
                  >
                    Buka Panel Guru
                    <ArrowRight aria-hidden className="h-4 w-4 text-flame" />
                  </Link>
                  </SpotlightCard>
                </Reveal>
              </ul>
            </div>
          </section>

          {/* THE PEAK: the model turns with the scroll */}
          <ScrollModel />

          {/* SUBJECTS: tilting cards */}
          <section id="mapel" aria-labelledby="mapel-title" className="scroll-mt-20">
            <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
              <SectionHead id="mapel-title" eyebrow="Mata pelajaran" title="Lima mapel, siap dipakai">
                Setiap mapel punya model 3D dan penanda bagian bawaan. Guru tinggal memilih dan menyesuaikan.
              </SectionHead>
              <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {SUBJECT_ORDER.map((cat, i) => {
                  const preset = SUBJECT_PRESETS[cat];
                  const node = preset.nodes[0];
                  const Icon = SUBJECT_ICONS[cat];
                  const pins = node.annotations?.length ?? 0;
                  return (
                    <li key={cat}>
                      <Reveal index={i}>
                        <TiltedCard
                          containerHeight={340}
                          containerWidth="100%"
                          imageHeight="100%"
                          imageWidth="100%"
                          radius={24}
                          rotateAmplitude={9}
                          scaleOnHover={1.03}
                        >
                          <div className="relative flex h-full flex-col border border-line bg-surface p-6 pt-8">
                            <span aria-hidden className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: node.color }} />
                            <TiltedCardLayer depth={36}>
                              <div className="flex items-center justify-between gap-3">
                                <span
                                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-deep"
                                  style={{ color: node.color }}
                                >
                                  <Icon aria-hidden className="h-6 w-6" />
                                </span>
                                <span className="font-mono text-xs uppercase tracking-widest text-mist">{SUBJECT_LABELS[cat]}</span>
                              </div>
                            </TiltedCardLayer>
                            <h3 className="mt-6 font-display text-xl font-bold leading-snug text-white">{preset.title}</h3>
                            <p className="mt-2 flex-1 text-[15px] leading-relaxed">{preset.description}</p>
                            {pins > 0 && (
                              <div className="mt-5 flex items-center gap-3 border-t border-line/60 pt-4">
                                <span aria-hidden className="flex gap-1">
                                  {Array.from({ length: Math.min(pins, 6) }, (_, d) => (
                                    <span key={d} className="h-2 w-2 rounded-full" style={{ backgroundColor: node.color }} />
                                  ))}
                                </span>
                                <span className="font-mono text-xs text-glow">{pins} penanda bagian</span>
                              </div>
                            )}
                          </div>
                        </TiltedCard>
                      </Reveal>
                    </li>
                  );
                })}
                <Reveal
                  as="li"
                  index={SUBJECT_ORDER.length}
                  hover
                  className="flex min-h-[340px] flex-col justify-center rounded-3xl border-2 border-dashed border-line p-6 transition-colors duration-200 hover:border-periwinkle"
                >
                  <Upload aria-hidden className="h-6 w-6 text-periwinkle" />
                  <h3 className="mt-4 font-display text-xl font-bold text-white">Materi lainnya</h3>
                  <p className="mt-2 text-[15px] leading-relaxed">Unggah model .glb sendiri dari Panel Guru.</p>
                </Reveal>
              </ul>
            </div>
          </section>

          {/* HOW IT WORKS: the line draws itself */}
          <section id="cara-kerja" aria-labelledby="cara-title" className="scroll-mt-20 bg-ink-deep">
            <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
              <SectionHead id="cara-title" eyebrow="Cara kerja" title="Tiga langkah dari materi ke lab" />
              <StepsTimeline steps={STEPS} />
            </div>
          </section>

          {/* FINAL CTA */}
          <section aria-labelledby="cta-title" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <Reveal className="relative overflow-hidden rounded-[2rem] bg-surface-hi px-6 py-16 text-center shadow-[0_40px_70px_-40px_rgba(10,8,60,0.9),inset_0_1px_0_rgba(255,255,255,0.12)] sm:px-12">
              <Sparkle className="left-[6%] top-[18%] h-8 w-8" />
              <Sparkle className="bottom-[16%] right-[7%] h-9 w-9" delay={2} />
              <h2 id="cta-title" className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
                Siap masuk ke ruang belajar?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">Nyalakan kamera, angkat tanganmu, dan sapa SYVA.</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Magnet padding={50}>
                  <Link href="/student" className={primaryBtn}>
                    Masuk Lab Siswa
                    <ArrowRight aria-hidden className="h-5 w-5" />
                  </Link>
                </Magnet>
                <Magnet padding={50}>
                  <Link href="/teacher" className={secondaryBtn}>
                    Buka Panel Guru
                  </Link>
                </Magnet>
              </div>
              <p className="mt-6 flex items-center justify-center gap-2 text-sm text-white/80">
                <Webcam aria-hidden className="h-4 w-4 shrink-0" />
                Membutuhkan webcam dan mikrofon. Paling optimal di Chrome desktop.
              </p>
            </Reveal>
          </section>
        </main>

        <footer className="border-t border-line/60">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>
              <span className="font-display font-bold text-white">SYVA</span> Spatial Lab
            </p>
            <p className="font-mono text-xs text-periwinkle">Gerakan tangan · Suara · 3D</p>
          </div>
        </footer>
      </div>
      </ClickSpark>
    </MotionProvider>
  );
}
