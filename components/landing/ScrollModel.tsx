'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion, useInView, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import { SUBJECT_LABELS, SUBJECT_ORDER, SUBJECT_PRESETS } from '@/lib/presets';

// WebGL only exists in the browser.
const Stage = dynamic(() => import('./ScrollModelStage'), { ssr: false, loading: () => <div className="h-full w-full" /> });

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow';

const SUBJECTS = SUBJECT_ORDER.map((cat) => {
  const preset = SUBJECT_PRESETS[cat];
  const node = preset.nodes[0];
  return { cat, label: SUBJECT_LABELS[cat], preset, node, asset: node.assetType, pins: node.annotations ?? [] };
});
const N = SUBJECTS.length;

/**
 * The peak of the page. The section is pinned while the scroll wheel turns one 3D model;
 * each fifth of the scroll swaps in the next subject, and its pins light up one by one.
 * With reduced motion nothing is pinned: the subject chips switch the model instead.
 */
export default function ScrollModel() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = Boolean(useReducedMotion());
  const inView = useInView(sectionRef, { margin: '120px 0px' });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  const [scrollIndex, setScrollIndex] = useState(0);
  const [pinIndex, setPinIndex] = useState(0);
  const [pinsOn, setPinsOn] = useState(false);
  const [manual, setManual] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const seg = Math.min(N - 0.0001, Math.max(0, v * N));
    const i = Math.floor(seg);
    const local = seg - i;
    const count = SUBJECTS[i].pins.length;
    setScrollIndex(i);
    setPinIndex(Math.min(Math.max(count - 1, 0), Math.floor(local * count)));
    setPinsOn(local > 0.2 && local < 0.96);
  });

  const active = reduce ? manual : scrollIndex;
  const subject = SUBJECTS[active];
  const showPins = reduce ? true : pinsOn;
  const activePin = reduce ? 0 : pinIndex;

  const goTo = (i: number) => {
    if (reduce) {
      setManual(i);
      return;
    }
    const el = sectionRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((i + 0.5) / N) * range, behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      id="jelajah"
      aria-labelledby="jelajah-title"
      className="relative scroll-mt-20 bg-ink-deep"
      style={reduce ? undefined : { height: `calc(100svh + ${N} * 85svh)` }}
    >
      <div className={reduce ? 'py-20' : 'sticky top-0 flex h-svh items-center overflow-hidden pb-20 sm:pb-0'}>
        <div className="mx-auto grid w-full max-w-6xl items-center gap-4 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
          {/* copy */}
          <div className="order-2 lg:order-1">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-lilac">Coba sendiri</p>
            <h2
              id="jelajah-title"
              className="mt-3 text-balance font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              Satu gulir, lima dunia pelajaran
            </h2>

            <div aria-live="polite" className="mt-5 min-h-[12.5rem] sm:min-h-[13.5rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={subject.cat}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                >
                  <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 font-mono text-xs uppercase tracking-widest text-mist">
                    <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: subject.node.color }} />
                    {subject.label}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-bold text-white sm:text-2xl">{subject.preset.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed">{subject.preset.description}</p>
                  <ol className="mt-4 flex flex-wrap gap-2">
                    {subject.pins.map((pin, i) => (
                      <li
                        key={pin.id}
                        className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors duration-200 ${
                          i === activePin && showPins ? 'border-flame bg-surface text-white' : 'border-line text-mist'
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                            i === activePin && showPins ? 'bg-flame text-ink-deep' : 'bg-ink text-white'
                          }`}
                        >
                          {i + 1}
                        </span>
                        {pin.label}
                      </li>
                    ))}
                  </ol>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* subject switcher: scrolls to that subject (or switches directly with reduced motion) */}
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Pilih mata pelajaran">
              {SUBJECTS.map((s, i) => (
                <li key={s.cat}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={i === active ? 'true' : undefined}
                    className={`min-h-11 cursor-pointer rounded-full border-2 px-4 text-sm font-semibold transition-colors duration-200 ${focusRing} ${
                      i === active ? 'border-flame bg-flame text-ink-deep' : 'border-line text-mist hover:border-periwinkle hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* stage: circle backdrop + the WebGL model, which may overflow the circle */}
          <div className="relative order-1 mx-auto aspect-square w-full max-w-[min(26rem,44svh)] lg:order-2 lg:max-w-[min(34rem,72svh)]">
            <div
              aria-hidden
              className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#5559d9_0%,#3836a8_60%,#2a2788_100%)] shadow-[0_40px_70px_-30px_rgba(10,8,60,0.9),inset_0_2px_0_rgba(255,255,255,0.14)]"
            />
            <div aria-hidden className="absolute -inset-[2%] rounded-full border border-dashed border-white/20" />
            <div
              role="img"
              aria-label={`Model 3D ${subject.preset.title}, diputar mengikuti gulir halaman`}
              className="absolute -inset-[8%]"
            >
              <Stage
                progress={scrollYProgress}
                count={N}
                asset={subject.asset}
                pins={subject.pins}
                activePin={activePin}
                showPins={showPins}
                running={inView}
                reduced={reduce}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
