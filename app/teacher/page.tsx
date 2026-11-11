'use client';

import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, ArrowRight, Box, Check, Cpu, Grid3x3, HeartPulse, Landmark, Orbit, Trash2, Upload } from 'lucide-react';
import { SyvaModule, SubjectCategory } from '@/types/syva';
import { SUBJECT_LABELS, SUBJECT_ORDER, SUBJECT_PRESETS } from '@/lib/presets';
import BlurText from '@/components/reactbits/BlurText';
import ClickSpark from '@/components/reactbits/ClickSpark';
import CountUp from '@/components/reactbits/CountUp';
import GlareHover from '@/components/reactbits/GlareHover';
import ShinyText from '@/components/reactbits/ShinyText';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import StarBorder from '@/components/reactbits/StarBorder';

// WebGL only exists in the browser.
const ModelPreview = dynamic(() => import('@/components/teacher/ModelPreview'), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

const SUBJECT_ICONS: Record<SubjectCategory, LucideIcon> = {
  TKJ_IT: Cpu,
  BIOLOGI: HeartPulse,
  FISIKA: Orbit,
  MATEMATIKA: Grid3x3,
  SEJARAH: Landmark,
  UMUM: Box,
};

/** localStorage holds roughly 5 MB, and a .glb is stored as base64 (about a third larger). */
const MAX_GLB_BYTES = 3 * 1024 * 1024;

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow';
const card =
  'rounded-3xl border border-line bg-surface p-5 shadow-[0_24px_40px_-28px_rgba(10,8,60,0.9),inset_0_1px_0_rgba(255,255,255,0.07)] sm:p-6';
const field =
  'min-h-12 w-full rounded-xl border border-line bg-ink-deep px-4 text-base text-white outline-none transition-colors placeholder:text-periwinkle focus:border-glow';

// Keeps the SYVA palette: the spotlight card's default black surface is overridden here.
const SPOT_VARS = {
  '--spotlight-card-surface': '#3836a8',
  '--spotlight-card-border': 'rgba(85, 89, 217, 0.9)',
  '--spotlight-card-shadow': '0 24px 40px -28px rgba(10, 8, 60, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
} as CSSProperties;

/** A step card with a soft cyan spotlight that follows the cursor. */
function Panel({ labelledBy, children }: { labelledBy: string; children: ReactNode }) {
  return (
    <SpotlightCard
      role="region"
      aria-labelledby={labelledBy}
      spotlightColor="#3fefff"
      intensity={0.1}
      spotlightSize={280}
      className="rounded-3xl p-5! sm:p-6!"
      style={SPOT_VARS}
    >
      {children}
    </SpotlightCard>
  );
}

function StepHead({ n, title, hint }: { n: number; title: string; hint?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-flame font-display text-lg font-extrabold text-ink-deep">
        {n}
      </span>
      <div>
        <h2 className="font-display text-xl font-bold leading-tight text-white">{title}</h2>
        {hint && <p className="mt-1 text-sm text-mist">{hint}</p>}
      </div>
    </div>
  );
}

export default function TeacherAuthoring() {
  const router = useRouter();
  const ids = useId();

  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory>('TKJ_IT');
  const [activeModule, setActiveModule] = useState<SyvaModule>(SUBJECT_PRESETS.TKJ_IT);
  const [hasCustomFile, setHasCustomFile] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleCategorySelect = (cat: SubjectCategory) => {
    setSelectedCategory(cat);
    setActiveModule(SUBJECT_PRESETS[cat]);
    setHasCustomFile(false);
    setFileName('');
    setError('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // lets the same file be picked again after removing it
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.glb')) {
      setError('Pilih file berformat .glb.');
      return;
    }
    if (file.size > MAX_GLB_BYTES) {
      setError(`Model terlalu besar (${(file.size / 1048576).toFixed(1)} MB). Maksimal 3 MB supaya muat di browser.`);
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      setHasCustomFile(true);
      setFileName(file.name);

      const updatedNodes = [...activeModule.nodes];
      updatedNodes[0] = {
        ...updatedNodes[0],
        customGlbUrl: base64Data,
      };
      setActiveModule({ ...activeModule, nodes: updatedNodes });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    const updatedNodes = [...activeModule.nodes];
    updatedNodes[0] = { ...updatedNodes[0], customGlbUrl: undefined };
    setActiveModule({ ...activeModule, nodes: updatedNodes });
    setHasCustomFile(false);
    setFileName('');
  };

  const handleApplyToLab = () => {
    try {
      localStorage.setItem('syva_active_module', JSON.stringify(activeModule));
    } catch {
      setError('Materi terlalu besar untuk disimpan di browser. Coba model .glb yang lebih kecil.');
      return;
    }
    router.push('/student');
  };

  const currentNode = activeModule.nodes[0];
  const pins = currentNode.annotations ?? [];
  const Icon = SUBJECT_ICONS[selectedCategory];

  return (
    <ClickSpark sparkColor="#ff7a1f" sparkSize={12} sparkRadius={26} sparkCount={9} duration={450}>
    <div className="relative min-h-screen overflow-x-clip bg-ink bg-[radial-gradient(ellipse_70%_45%_at_70%_0%,#3633a6_0%,transparent_70%)] font-sans text-mist">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Link href="/" className={`rounded font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl ${focusRing}`}>
          <span className="relative inline-block">
            S
            <span aria-hidden className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-flame" />
          </span>
          YVA
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 border-line px-4 text-sm font-semibold text-white transition-colors duration-200 hover:border-periwinkle ${focusRing}`}
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Beranda
          </Link>
          <button
            type="button"
            onClick={handleApplyToLab}
            className={`hidden min-h-11 cursor-pointer items-center gap-2 rounded-full bg-flame px-5 text-sm font-bold text-ink-deep shadow-[0_8px_20px_-8px_rgba(255,122,31,0.7)] transition-colors duration-200 hover:bg-flame-hi sm:inline-flex ${focusRing}`}
          >
            Tampilkan di Lab Siswa
            <ArrowRight aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6">
        <div className="max-w-2xl">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em]">
            <ShinyText text="Panel Guru" color="#c4c0ff" shineColor="#ffffff" speed={3} />
          </p>
          <div role="heading" aria-level={1} className="mt-3">
            <BlurText
              text="Siapkan materi, lalu tampilkan di lab"
              delay={90}
              animateBy="words"
              direction="top"
              className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl"
            />
          </div>
          <p className="mt-4 text-lg leading-relaxed">
            Pilih mata pelajaran, sesuaikan naskah penjelasan, dan SYVA akan membacakannya untuk siswa.
          </p>
        </div>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1.25fr_1fr] lg:gap-8">
          {/* live preview (first on small screens so the effect of each choice is visible) */}
          <aside aria-label="Pratinjau materi" className="order-first lg:sticky lg:top-6 lg:order-last">
            <GlareHover
              background="#3836a8"
              borderColor="#5559d9"
              borderRadius="24px"
              glareColor="#ffffff"
              glareOpacity={0.18}
              className="border p-5 shadow-[0_24px_40px_-28px_rgba(10,8,60,0.9),inset_0_1px_0_rgba(255,255,255,0.07)] sm:p-6"
            >
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-lilac">Pratinjau</p>

              <div className="relative mx-auto mt-3 aspect-square w-full max-w-[min(22rem,38svh)] lg:max-w-none">
                <div
                  aria-hidden
                  className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#5559d9_0%,#3836a8_60%,#2a2788_100%)] shadow-[0_30px_50px_-28px_rgba(10,8,60,0.9),inset_0_2px_0_rgba(255,255,255,0.14)]"
                />
                <div aria-hidden className="absolute -inset-[1%] rounded-full border border-dashed border-white/20" />
                <div role="img" aria-label={`Pratinjau 3D ${activeModule.title}`} className="absolute -inset-[6%]">
                  <ModelPreview asset={currentNode.assetType} />
                </div>
              </div>

              <div className="mt-4" aria-live="polite">
                <span className="inline-flex items-center gap-2 rounded-full bg-ink-deep px-3 py-1 font-mono text-xs uppercase tracking-widest text-mist">
                  <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: currentNode.color }} />
                  {SUBJECT_LABELS[selectedCategory]}
                </span>
                <h3 className="mt-3 font-display text-xl font-bold leading-snug text-white">{activeModule.title || 'Tanpa judul'}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed">{currentNode.description || 'Belum ada naskah penjelasan.'}</p>
                {pins.length > 0 && (
                  <p className="mt-4 font-mono text-xs text-glow">
                    <CountUp key={selectedCategory} to={pins.length} duration={0.8} trigger="load" /> penanda bagian
                  </p>
                )}
                {pins.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2" aria-label="Penanda bagian">
                    {pins.map((pin, i) => (
                      <li key={pin.id} className="flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-mist">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-ink-deep text-[10px] font-bold text-white">
                          {i + 1}
                        </span>
                        {pin.label}
                      </li>
                    ))}
                  </ul>
                )}
                {hasCustomFile && (
                  <p className="mt-4 flex items-start gap-2 rounded-xl border border-glow/40 bg-ink-deep px-3 py-2 text-xs text-white">
                    <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-glow" />
                    Lab akan memakai model kustom <span className="font-semibold">{fileName}</span>, bukan model bawaan di atas.
                  </p>
                )}
              </div>
            </GlareHover>
          </aside>

          <div className="space-y-6">
            {/* STEP 1 */}
            <Panel labelledBy={`${ids}-s1`}>
              <div id={`${ids}-s1`}>
                <StepHead n={1} title="Pilih mata pelajaran" hint="Judul, naskah, dan penanda 3D terisi otomatis." />
              </div>
              <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {SUBJECT_ORDER.map((cat) => {
                  const SubjectIcon = SUBJECT_ICONS[cat];
                  const node = SUBJECT_PRESETS[cat].nodes[0];
                  const selected = selectedCategory === cat;
                  return (
                    <li key={cat}>
                      <button
                        type="button"
                        onClick={() => handleCategorySelect(cat)}
                        aria-pressed={selected}
                        className={`relative flex min-h-[5.5rem] w-full cursor-pointer flex-col items-start gap-2 rounded-2xl border-2 p-3 text-left transition-colors duration-200 ${focusRing} ${
                          selected ? 'border-flame bg-surface-hi' : 'border-line bg-ink-deep hover:border-periwinkle'
                        }`}
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink" style={{ color: node.color }}>
                          <SubjectIcon aria-hidden className="h-5 w-5" />
                        </span>
                        <span className={`text-sm font-semibold ${selected ? 'text-white' : 'text-mist'}`}>{SUBJECT_LABELS[cat]}</span>
                        {selected && (
                          <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-flame text-ink-deep">
                            <Check aria-hidden className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Panel>

            {/* STEP 2 */}
            <Panel labelledBy={`${ids}-s2`}>
              <div id={`${ids}-s2`}>
                <StepHead n={2} title="Edit materi" hint="Naskah penjelasan dibacakan otomatis oleh asisten SYVA." />
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <label htmlFor={`${ids}-title`} className="mb-1.5 block text-sm font-semibold text-white">
                    Judul modul pembelajaran
                  </label>
                  <input
                    id={`${ids}-title`}
                    type="text"
                    value={activeModule.title}
                    onChange={(e) => setActiveModule({ ...activeModule, title: e.target.value })}
                    className={`${field} font-semibold`}
                  />
                </div>

                <div>
                  <label htmlFor={`${ids}-label`} className="mb-1.5 block text-sm font-semibold text-white">
                    Label aset 3D
                  </label>
                  <input
                    id={`${ids}-label`}
                    type="text"
                    value={currentNode.label}
                    onChange={(e) => {
                      const updatedNode = { ...currentNode, label: e.target.value };
                      setActiveModule({ ...activeModule, nodes: [updatedNode] });
                    }}
                    className={`${field} font-semibold`}
                  />
                </div>

                <div>
                  <label htmlFor={`${ids}-desc`} className="mb-1.5 block text-sm font-semibold text-white">
                    Penjelasan lisan materi
                  </label>
                  <textarea
                    id={`${ids}-desc`}
                    rows={5}
                    value={currentNode.description}
                    onChange={(e) => {
                      const updatedNode = { ...currentNode, description: e.target.value };
                      setActiveModule({
                        ...activeModule,
                        description: e.target.value,
                        nodes: [updatedNode],
                      });
                    }}
                    className={`${field} min-h-32 resize-y py-3 leading-relaxed`}
                  />
                  <p className="mt-1.5 text-right font-mono text-xs text-periwinkle">{currentNode.description.length} karakter</p>
                </div>

                <div className="border-t border-line/60 pt-5">
                  <p className="mb-1.5 text-sm font-semibold text-white">Model 3D sendiri (opsional)</p>
                  {hasCustomFile ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-glow/40 bg-ink-deep p-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface text-glow">
                        <Check aria-hidden className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{fileName}</p>
                        <p className="text-xs text-mist">Tersimpan untuk Lab Siswa.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        aria-label={`Hapus model ${fileName}`}
                        className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-mist transition-colors hover:bg-surface hover:text-white ${focusRing}`}
                      >
                        <Trash2 aria-hidden className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor={`${ids}-file`}
                      className="flex min-h-[4.5rem] cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-line p-3 transition-colors duration-200 hover:border-periwinkle focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-glow"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-deep text-periwinkle">
                        <Upload aria-hidden className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-white">Unggah file .glb</span>
                        <span className="block text-xs text-mist">Kosongkan untuk memakai model bawaan. Maksimal 3 MB.</span>
                      </span>
                      <input id={`${ids}-file`} type="file" accept=".glb" onChange={handleFileUpload} className="sr-only" />
                    </label>
                  )}
                </div>
              </div>
            </Panel>

            {/* STEP 3 */}
            <Panel labelledBy={`${ids}-s3`}>
              <div id={`${ids}-s3`}>
                <StepHead n={3} title="Tampilkan di lab" hint="Materi dibuka di Lab Siswa pada perangkat dan browser yang sama." />
              </div>
              {error && (
                <p role="alert" className="mt-4 rounded-xl border border-flame/60 bg-ink px-4 py-3 text-sm text-white">
                  {error}
                </p>
              )}
              <StarBorder
                type="button"
                onClick={handleApplyToLab}
                color="#3fefff"
                backgroundColor="#ff7a1f"
                textColor="#1f1c6b"
                borderColor="#ff9445"
                radius={28}
                duration={5}
                className={`mt-5 w-full cursor-pointer text-base font-bold ${focusRing}`}
              >
                <span className="flex min-h-14 items-center justify-center gap-2">
                  Simpan materi &amp; tampilkan
                  <ArrowRight aria-hidden className="h-5 w-5" />
                </span>
              </StarBorder>
              <p className="mt-3 flex items-center gap-2 text-xs text-periwinkle">
                <Icon aria-hidden className="h-4 w-4 shrink-0" />
                {SUBJECT_LABELS[selectedCategory]}: {activeModule.title || 'Tanpa judul'}
              </p>
            </Panel>
          </div>
        </div>
      </main>
    </div>
    </ClickSpark>
  );
}
