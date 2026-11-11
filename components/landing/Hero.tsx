'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AudioLines, ChevronLeft, ChevronRight, Hand } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionStyle, type MotionValue } from 'motion/react';
import { SUBJECT_LABELS, SUBJECT_ORDER, SUBJECT_PRESETS } from '@/lib/presets';
import ShinyText from '@/components/reactbits/ShinyText';
import HeroTitle from './HeroTitle';

// WebGL only exists in the browser; the circle stays visible while it loads.
const Robot3D = dynamic(() => import('./Robot3D'), { ssr: false });

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow';
const POP = { type: 'spring', stiffness: 90, damping: 14 } as const;

/** Four-point sparkle, the decorative motif of the landing page. Slow twinkle, still under reduced motion. */
export function Sparkle({ className, delay = 0, style }: { className: string; delay?: number; style?: MotionStyle }) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`pointer-events-none absolute text-lilac ${className}`}
      style={{ opacity: 0.5, ...style }}
      animate={reduce ? undefined : { opacity: [0.4, 0.6, 0.4], scale: [0.9, 1.06, 0.9] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <path
        d="M12 2c0 6 4 10 10 10-6 0-10 4-10 10 0-6-4-10-10-10 6 0 10-4 10-10Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

const SPARKLES = [
  { className: 'left-[5%] top-[18%] h-7 w-7', delay: 0 },
  { className: 'left-[38%] top-[3%] h-12 w-12', delay: 1.2 },
  { className: 'right-[14%] top-[22%] h-8 w-8', delay: 2.1 },
  { className: 'left-[3%] bottom-[24%] h-8 w-8', delay: 0.6 },
  { className: 'left-[52%] bottom-[8%] h-7 w-7', delay: 2.8 },
  { className: 'right-[4%] bottom-[18%] h-9 w-9', delay: 1.6 },
  { className: 'left-[24%] bottom-[5%] h-6 w-6', delay: 3.3 },
];

/** Right-hand spotlight: cycles through the real subject modules. */
function InfoPanel({ y }: { y?: MotionValue<number> }) {
  const [index, setIndex] = useState(0);
  const cat = SUBJECT_ORDER[index];
  const preset = SUBJECT_PRESETS[cat];
  const node = preset.nodes[0];
  const pins = node.annotations?.length ?? 0;
  const step = (d: number) => setIndex((i) => (i + d + SUBJECT_ORDER.length) % SUBJECT_ORDER.length);

  return (
    <motion.aside
      aria-label="Sorotan modul"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...POP, delay: 0.5 }}
      style={y ? { y } : undefined}
      className="relative z-10 order-3 mx-auto w-full max-w-md md:col-span-2 lg:col-span-1 lg:mx-0 lg:max-w-none"
    >
      <div className="rounded-3xl border border-white/15 bg-ink-deep p-6 shadow-[0_28px_50px_-24px_rgba(10,8,60,0.9),inset_0_1px_0_rgba(255,255,255,0.08)]">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-lilac">Sorotan modul</p>

        <div aria-live="polite" className="mt-4 min-h-[11.5rem]">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 font-mono text-xs uppercase tracking-widest text-mist">
            <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: node.color }} />
            {SUBJECT_LABELS[cat]}
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-white">{preset.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-mist">{preset.description}</p>
          {pins > 0 && <p className="mt-3 font-mono text-xs text-glow">{pins} penanda bagian</p>}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line/60 pt-5">
          <Link
            href="/student"
            className={`inline-flex min-h-11 cursor-pointer items-center gap-1 whitespace-nowrap rounded text-sm font-semibold text-white underline decoration-flame decoration-2 underline-offset-8 transition-colors hover:text-flame-hi ${focusRing}`}
          >
            Coba di Lab
            <ChevronRight aria-hidden className="h-4 w-4 text-flame" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="mr-1 font-mono text-xs text-periwinkle">
              {index + 1}/{SUBJECT_ORDER.length}
            </span>
            <button
              type="button"
              aria-label="Modul sebelumnya"
              onClick={() => step(-1)}
              className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-iris text-white transition-colors duration-200 hover:bg-surface-hi ${focusRing}`}
            >
              <ChevronLeft aria-hidden className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Modul berikutnya"
              onClick={() => step(1)}
              className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-flame text-ink-deep transition-colors duration-200 hover:bg-flame-hi ${focusRing}`}
            >
              <ChevronRight aria-hidden className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

/** Small static label that explains what the mascot's world can do. */
function FeatureChip({
  icon: Icon,
  label,
  className,
  y,
}: {
  icon: typeof Hand;
  label: string;
  className: string;
  y?: MotionValue<number>;
}) {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...POP, delay: 0.9 }}
      style={y ? { y } : undefined}
      className={`absolute z-10 hidden items-center gap-2 rounded-full border border-white/20 bg-ink-deep px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_-12px_rgba(10,8,60,0.9)] sm:flex ${className}`}
    >
      <Icon className="h-4 w-4 text-glow" />
      {label}
    </motion.div>
  );
}

/**
 * Hero: title + CTA | circle stage with the 3D mascot | spotlight panel.
 * Depth comes from planes that drift at different rates while scrolling:
 * text and circle stage (back), the robot, then the floating chips (front).
 */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  // Back planes lag behind the scroll, front planes run ahead of it.
  const textY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const stageY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const robotY = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const chipY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const panelY = useTransform(scrollYProgress, [0, 1], [0, -24]);
  const depth = (v: MotionValue<number>) => (reduce ? undefined : v);

  return (
    <section
      ref={ref}
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-[radial-gradient(circle_at_50%_45%,#4b50e6_0%,#3137b8_55%,#262b96_100%)] pt-16 lg:pt-20"
    >
      {SPARKLES.map((s) => (
        <Sparkle key={s.className} {...s} />
      ))}

      <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl grid-cols-1 items-center gap-x-8 gap-y-12 px-4 pb-16 pt-10 sm:px-6 md:grid-cols-[45fr_55fr] lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[35fr_40fr_25fr] lg:px-10 lg:py-12">
        {/* LEFT: title, subtitle, CTA */}
        <motion.div
          style={reduce ? undefined : { y: textY }}
          className="relative z-10 order-2 flex flex-col items-center text-center md:order-1 md:items-start md:text-left"
        >
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...POP, delay: 0.05 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-ink-deep px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-lilac"
          >
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-glow" />
            <ShinyText text="SMK IT As-Syifa" color="#c4c0ff" shineColor="#ffffff" speed={3} />
          </motion.p>
          <HeroTitle />
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...POP, delay: 0.45 }}
            className="mt-6 max-w-sm text-lg leading-relaxed text-white/85"
          >
            Belajar simulasi ruang 3D secara interaktif, cukup dengan gerakan tangan dan suara.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...POP, delay: 0.55 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:justify-start"
          >
            <Link
              href="/student"
              className={`inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-flame px-7 font-bold text-ink-deep shadow-[0_14px_28px_-12px_rgba(255,122,31,0.8)] transition-colors duration-200 hover:bg-flame-hi ${focusRing}`}
            >
              Mulai sekarang
              <ChevronRight aria-hidden className="h-4 w-4" />
            </Link>
            <a
              href="#cara-kerja"
              className={`inline-flex min-h-11 cursor-pointer items-center rounded text-sm font-semibold text-white underline decoration-white/35 decoration-2 underline-offset-8 transition-colors duration-200 hover:decoration-flame ${focusRing}`}
            >
              Lihat cara kerja
            </a>
          </motion.div>
        </motion.div>

        {/* CENTER: circle stage; the robot overflows the top of the circle */}
        <div className="relative order-1 mx-auto mt-12 aspect-square w-full max-w-[300px] md:order-2 md:mt-0 md:max-w-[420px]">
          <motion.div style={reduce ? undefined : { y: stageY }} className="absolute inset-0">
            <div aria-hidden className="pointer-events-none absolute -inset-[30%] rounded-full border border-white/15" />
            <div aria-hidden className="pointer-events-none absolute -inset-[14%] rounded-full border border-dashed border-white/20" />
            <motion.div
              aria-hidden
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...POP, delay: 0.2 }}
              className="absolute inset-0 overflow-hidden rounded-full bg-[radial-gradient(circle_at_35%_30%,#7176ff_0%,#5257ea_55%,#4146d6_100%)] shadow-[0_40px_70px_-30px_rgba(10,8,60,0.9),inset_0_2px_0_rgba(255,255,255,0.18)]"
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_45%,rgba(255,255,255,0.07)_45%,rgba(255,255,255,0.07)_62%,transparent_62%)]" />
            </motion.div>
            <svg aria-hidden viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 overflow-visible">
              <motion.path
                d="M74.7 7.22A49.4 49.4 0 0 1 74.7 92.78"
                fill="none"
                stroke="#ffffff"
                strokeWidth=".6"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
              />
            </svg>
          </motion.div>
          <motion.div style={reduce ? undefined : { y: robotY }} className="absolute -inset-x-[15%] -bottom-[8%] -top-[28%]">
            <Robot3D className="h-full w-full" />
          </motion.div>
          <FeatureChip icon={Hand} label="Putar dengan tangan" className="-left-[14%] top-[64%]" y={depth(chipY)} />
          <FeatureChip icon={AudioLines} label="“Oke SYVA”" className="-right-[10%] bottom-[6%]" y={depth(chipY)} />
        </div>

        {/* RIGHT: spotlight panel (moves below on tablet, stacks last on mobile) */}
        <InfoPanel y={depth(panelY)} />
      </div>
    </section>
  );
}
