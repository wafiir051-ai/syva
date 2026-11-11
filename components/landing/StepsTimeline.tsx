'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow';

export interface StepData {
  title: string;
  body: string;
  cta?: { href: string; label: string };
}

function Step({ step, index, total, progress }: { step: StepData; index: number; total: number; progress: MotionValue<number> }) {
  // Each number lights up (indigo to orange) as the drawn line reaches it.
  const at = total > 1 ? index / (total - 1) : 0;
  const from = Math.max(0, at - 0.12);
  const background = useTransform(progress, [from, at], ['#3836a8', '#ff7a1f']);
  const color = useTransform(progress, [from, at], ['#cbceff', '#1f1c6b']);

  return (
    <li className="relative flex gap-5 md:flex-col md:gap-6">
      <motion.span
        style={{ background, color }}
        className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-line font-display text-xl font-extrabold shadow-[0_0_0_6px_#1f1c6b]"
      >
        {index + 1}
      </motion.span>
      <div>
        <h3 className="font-display text-xl font-bold text-white">{step.title}</h3>
        <p className="mt-2 leading-relaxed">{step.body}</p>
        {step.cta && (
          <Link
            href={step.cta.href}
            className={`mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded font-semibold text-glow transition-colors hover:text-white ${focusRing}`}
          >
            {step.cta.label}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        )}
      </div>
    </li>
  );
}

/** Three steps joined by a line that draws itself as the section scrolls into view. */
export default function StepsTimeline({ steps }: { steps: StepData[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 78%', 'end 62%'] });
  const done = useMotionValue(1);
  const progress = reduce ? done : scrollYProgress;

  return (
    <ol ref={ref} className="relative mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
      {/* desktop: horizontal rail */}
      <span aria-hidden className="absolute left-6 right-6 top-6 hidden h-0.5 bg-line md:block" />
      <motion.span
        aria-hidden
        style={{ scaleX: progress }}
        className="absolute left-6 right-6 top-6 hidden h-0.5 origin-left bg-flame md:block"
      />
      {/* mobile: vertical rail */}
      <span aria-hidden className="absolute bottom-6 left-6 top-6 w-0.5 -translate-x-1/2 bg-line md:hidden" />
      <motion.span
        aria-hidden
        style={{ scaleY: progress }}
        className="absolute bottom-6 left-6 top-6 w-0.5 origin-top -translate-x-1/2 bg-flame md:hidden"
      />
      {steps.map((step, i) => (
        <Step key={step.title} step={step} index={i} total={steps.length} progress={progress} />
      ))}
    </ol>
  );
}
