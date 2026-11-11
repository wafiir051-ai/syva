'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Cpu, Send, Sparkles, X } from 'lucide-react';
import {
  MODEL_DOWNLOAD_HINT,
  SERVER_STATUS,
  SITE_CONTEXT,
  SyvaAIError,
  askSyva,
  checkServerAI,
  getAIStatus,
  isModelCached,
  prepareSyva,
  subscribeAI,
  type ChatTurn,
} from '@/lib/syva-ai';

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow';
const SUGGESTIONS = ['Apa itu SYVA?', 'Bagaimana cara pakai gerakan tangan?', 'Mapel apa saja yang ada?'];
const GREETING = 'Halo, aku SYVA! Tanya apa saja soal lab ini atau materi belajarnya.';

type Msg = { id: number; role: 'user' | 'assistant'; content: string };

/** Floating chat with the mascot. Opens from the button or by clicking the robot itself. */
export default function RobotChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ id: 0, role: 'assistant', content: GREETING }]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const status = useSyncExternalStore(subscribeAI, getAIStatus, () => SERVER_STATUS);
  // null = still checking whether the server (Groq) AI is configured.
  const [serverReady, setServerReady] = useState<boolean | null>(null);
  const ready = serverReady === true || status.phase === 'ready';

  const nextId = useRef(1);
  const abortRef = useRef<AbortController | null>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    abortRef.current?.abort();
    setOpen(false);
    launcherRef.current?.focus();
  }, []);

  // Clicking the 3D robot opens the chat.
  useEffect(() => {
    const onRobot = () => setOpen(true);
    window.addEventListener('syva:robot-click', onRobot);
    return () => window.removeEventListener('syva:robot-click', onRobot);
  }, []);

  useEffect(() => {
    if (!open || serverReady !== null) return;
    checkServerAI().then(setServerReady);
  }, [open, serverReady]);

  // Without server AI: if the model is already cached on this device, load it without asking (no download).
  useEffect(() => {
    if (!open || serverReady !== false || status.phase !== 'idle') return;
    let cancelled = false;
    isModelCached().then((cached) => {
      if (cached && !cancelled) prepareSyva().catch(() => {});
    });
    return () => {
      cancelled = true;
    };
  }, [open, serverReady, status.phase]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  useEffect(() => {
    if (open && ready) inputRef.current?.focus();
  }, [open, ready]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    endRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'end' });
  }, [messages, status.phase]);

  const activate = () => {
    setError('');
    prepareSyva().catch(() => {});
  };

  const send = async (raw: string) => {
    const question = raw.trim();
    if (!question || pending || !ready) return;

    const history: ChatTurn[] = messages.slice(1).map(({ role, content }) => ({ role, content }));
    const userMsg: Msg = { id: nextId.current++, role: 'user', content: question };
    const replyId = nextId.current++;
    setMessages((m) => [...m, userMsg, { id: replyId, role: 'assistant', content: '' }]);
    setInput('');
    setError('');
    setPending(true);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const answer = await askSyva({
        question,
        history,
        context: SITE_CONTEXT,
        signal: controller.signal,
        onToken: (text) => setMessages((m) => m.map((x) => (x.id === replyId ? { ...x, content: text } : x))),
      });
      setMessages((m) => m.map((x) => (x.id === replyId ? { ...x, content: answer } : x)));
      window.dispatchEvent(new CustomEvent('syva:hello')); // the robot waves
    } catch (e) {
      setMessages((m) => m.filter((x) => x.id !== replyId));
      if (!(e instanceof SyvaAIError && e.kind === 'abort')) {
        setError(e instanceof Error ? e.message : 'SYVA sedang tidak bisa menjawab.');
      }
    } finally {
      setPending(false);
    }
  };

  const loading = status.phase === 'checking' || status.phase === 'loading';
  const pct = Math.round(status.progress * 100);

  if (!open) {
    return (
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen(true)}
        className={`fixed bottom-4 right-4 z-40 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-flame px-5 font-bold text-ink-deep shadow-[0_16px_32px_-12px_rgba(255,122,31,0.8)] transition-colors duration-200 hover:bg-flame-hi sm:bottom-6 sm:right-6 ${focusRing}`}
      >
        <Sparkles aria-hidden className="h-5 w-5" />
        Tanya SYVA
      </button>
    );
  }

  return (
    <section
      role="dialog"
      aria-label="Obrolan dengan SYVA"
      className="fixed inset-x-3 bottom-3 z-40 flex max-h-[min(34rem,calc(100svh-1.5rem))] flex-col overflow-hidden rounded-3xl border border-line bg-ink-deep shadow-[0_28px_60px_-20px_rgba(10,8,60,0.95)] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[24rem]"
    >
      <header className="flex items-center justify-between gap-3 border-b border-line/60 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-flame text-ink-deep">
            <Sparkles aria-hidden className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-lg font-bold leading-none text-white">SYVA</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-glow">
              {serverReady ? 'Ditenagai Groq · tanpa login' : 'AI di perangkatmu · tanpa login'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Tutup obrolan"
          className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-mist transition-colors hover:bg-surface hover:text-white ${focusRing}`}
        >
          <X aria-hidden className="h-5 w-5" />
        </button>
      </header>

      {ready ? (
        <>
          <div role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m) => (
              <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex'}>
                <p
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user' ? 'rounded-br-md bg-flame font-medium text-ink-deep' : 'rounded-bl-md bg-surface text-white'
                  }`}
                >
                  {m.content || <span className="text-mist">SYVA sedang berpikir...</span>}
                </p>
              </div>
            ))}
            {messages.length === 1 && (
              <ul className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => send(s)}
                      className={`min-h-11 cursor-pointer rounded-full border border-line px-4 text-left text-xs font-medium text-mist transition-colors hover:border-periwinkle hover:text-white ${focusRing}`}
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {error && (
              <p role="alert" className="rounded-xl border border-flame/50 bg-ink px-3 py-2 text-xs text-white">
                {error}
              </p>
            )}
            <div ref={endRef} />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2 border-t border-line/60 p-3"
          >
            <label htmlFor="syva-chat-input" className="sr-only">
              Pertanyaan untuk SYVA
            </label>
            <input
              id="syva-chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={300}
              placeholder="Tulis pertanyaanmu..."
              autoComplete="off"
              className="min-h-11 flex-1 rounded-xl border border-line bg-surface px-3 text-sm text-white outline-none placeholder:text-periwinkle focus:border-glow"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              aria-label="Kirim pertanyaan"
              className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-flame text-ink-deep transition-colors hover:bg-flame-hi disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
            >
              <Send aria-hidden className="h-4 w-4" />
            </button>
          </form>
          {serverReady && (
            <p className="px-4 pb-3 font-mono text-[10px] text-periwinkle">Pertanyaanmu dikirim ke Groq untuk dijawab.</p>
          )}
        </>
      ) : (
        <div className="space-y-4 overflow-y-auto px-4 py-5 text-sm leading-relaxed">
          <p className="text-white">{GREETING}</p>
          {serverReady === null && <p className="text-mist">Menghubungkan SYVA...</p>}
          {serverReady === false && status.phase === 'idle' && (
            <>
              <p className="text-mist">
                Supaya bisa menjawab, SYVA AI berjalan langsung di perangkatmu. Tidak perlu login dan pertanyaanmu tidak dikirim ke
                mana pun. Pertama kali, perlu mengunduh model {MODEL_DOWNLOAD_HINT} (sekali saja, lalu tersimpan di browser).
              </p>
              <button
                type="button"
                onClick={activate}
                className={`inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-flame px-6 font-bold text-ink-deep transition-colors hover:bg-flame-hi ${focusRing}`}
              >
                <Cpu aria-hidden className="h-4 w-4" />
                Aktifkan SYVA AI
              </button>
              <p className="font-mono text-[11px] text-periwinkle">Butuh Chrome desktop dengan WebGPU. Sebaiknya pakai Wi-Fi.</p>
            </>
          )}
          {loading && (
            <div aria-live="polite">
              <p className="text-mist">{status.phase === 'checking' ? 'Memeriksa perangkat...' : 'Menyiapkan SYVA AI. Jangan tutup halaman ini.'}</p>
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
                aria-label="Kemajuan unduhan SYVA AI"
                className="mt-3 h-2 overflow-hidden rounded-full bg-surface"
              >
                <div className="h-full rounded-full bg-flame transition-[width] duration-300" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 font-mono text-[11px] text-periwinkle">{pct}%</p>
            </div>
          )}
          {(status.phase === 'unsupported' || status.phase === 'error') && (
            <>
              <p role="alert" className="rounded-xl border border-flame/50 bg-ink px-3 py-2 text-white">
                {status.text}
              </p>
              {status.phase === 'error' && (
                <button
                  type="button"
                  onClick={activate}
                  className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 border-line px-5 font-semibold text-white transition-colors hover:border-periwinkle ${focusRing}`}
                >
                  Coba lagi
                </button>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
