/**
 * SYVA's brain. Two engines, tried in this order:
 *  1. Server (Groq) via /api/syva, when GROQ_API_KEY is set: fast and accurate. The
 *     question is sent to Groq; the key stays on the server.
 *  2. On-device (WebLLM + WebGPU): no account, no key, nothing leaves the device.
 *     The first use downloads the model once (hundreds of MB) into the browser
 *     cache, so it only starts after an explicit click (`prepareSyva`).
 * Browser-only: call it from event handlers, never during SSR.
 */

import type { MLCEngineInterface } from '@mlc-ai/web-llm';
import { buildSystemPrompt } from './syva-prompt';

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

export type AIPhase = 'idle' | 'checking' | 'loading' | 'ready' | 'unsupported' | 'error';
export interface AIStatus {
  phase: AIPhase;
  /** 0 to 1 while loading. */
  progress: number;
  text: string;
}

export type SyvaAIErrorKind = 'unsupported' | 'not-ready' | 'busy' | 'abort' | 'failed' | 'unavailable';

export class SyvaAIError extends Error {
  constructor(
    message: string,
    public kind: SyvaAIErrorKind
  ) {
    super(message);
    this.name = 'SyvaAIError';
  }
}

/** Preferred model first; the f32 build is for GPUs without shader-f16. */
const MODEL_F16 = 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC';
const MODEL_F32 = 'Qwen2.5-1.5B-Instruct-q4f32_1-MLC';
/** Approximate one-time download, shown to the user before they agree. */
export const MODEL_DOWNLOAD_HINT = '±0,9 GB';

/* ----------------------------------------------------------------- status */

export const SERVER_STATUS: AIStatus = { phase: 'idle', progress: 0, text: '' };
let status: AIStatus = SERVER_STATUS;
const listeners = new Set<() => void>();

function setStatus(next: Partial<AIStatus>) {
  status = { ...status, ...next };
  listeners.forEach((l) => l());
}

export const getAIStatus = () => status;

export function subscribeAI(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/* ----------------------------------------------------------------- engine */

let enginePromise: Promise<MLCEngineInterface> | null = null;
let modelId: string | null = null;
let busy = false;

async function pickModel(): Promise<string> {
  const override = typeof localStorage !== 'undefined' ? localStorage.getItem('syva_ai_model') : null;
  if (override) return override; // dev/testing: e.g. a smaller model
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<{ features: Set<string> } | null> } }).gpu;
  if (!gpu) throw new SyvaAIError('Browser ini belum mendukung WebGPU. Pakai Chrome terbaru di laptop/desktop.', 'unsupported');
  const adapter = await gpu.requestAdapter();
  if (!adapter) throw new SyvaAIError('Kartu grafis perangkat ini tidak bisa dipakai untuk AI.', 'unsupported');
  return adapter.features.has('shader-f16') ? MODEL_F16 : MODEL_F32;
}

/** True when the model is already in the browser cache (so loading needs no download). */
export async function isModelCached(): Promise<boolean> {
  try {
    const webllm = await import('@mlc-ai/web-llm');
    return await webllm.hasModelInCache(modelId ?? (await pickModel()));
  } catch {
    return false;
  }
}

/** Starts (or joins) loading the model. Downloads it the first time. */
export function prepareSyva(): Promise<void> {
  if (!enginePromise) {
    enginePromise = (async () => {
      setStatus({ phase: 'checking', progress: 0, text: 'Memeriksa perangkat...' });
      modelId = await pickModel();
      const webllm = await import('@mlc-ai/web-llm');
      setStatus({ phase: 'loading', progress: 0, text: 'Menyiapkan SYVA AI...' });
      const worker = new Worker(new URL('./syva-llm.worker.ts', import.meta.url), { type: 'module' });
      const engine = await webllm.CreateWebWorkerMLCEngine(worker, modelId, {
        initProgressCallback: (report) => setStatus({ phase: 'loading', progress: report.progress, text: report.text }),
      });
      setStatus({ phase: 'ready', progress: 1, text: 'SYVA AI siap' });
      return engine;
    })().catch((e: unknown) => {
      enginePromise = null;
      const unsupported = e instanceof SyvaAIError && e.kind === 'unsupported';
      const message = e instanceof Error ? e.message : 'Gagal menyiapkan SYVA AI.';
      setStatus({ phase: unsupported ? 'unsupported' : 'error', progress: 0, text: message });
      throw e instanceof SyvaAIError ? e : new SyvaAIError(message, 'failed');
    });
  }
  return enginePromise.then(() => undefined);
}

/* ---------------------------------------------------------------- prompts */

export { SITE_CONTEXT } from './syva-prompt';

/* ----------------------------------------------------------- server (Groq) */

let serverState: 'unknown' | 'yes' | 'no' = 'unknown';

/** True when the server has a Groq key configured (see app/api/syva/route.ts). */
export async function checkServerAI(): Promise<boolean> {
  if (serverState !== 'unknown') return serverState === 'yes';
  try {
    const res = await fetch('/api/syva', { cache: 'no-store' });
    const data = (await res.json()) as { configured?: boolean };
    serverState = data.configured ? 'yes' : 'no';
  } catch {
    serverState = 'no';
  }
  return serverState === 'yes';
}

async function askServer({ question, history = [], context, onToken, signal }: AskOptions): Promise<string> {
  let res: Response;
  try {
    res = await fetch('/api/syva', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history: history.slice(-6), context }),
      signal,
    });
  } catch (e) {
    if (signal?.aborted) throw new SyvaAIError('Dibatalkan', 'abort');
    serverState = 'no';
    throw new SyvaAIError('Server AI tidak terjangkau.', 'unavailable');
  }

  if (res.status === 503) {
    serverState = 'no';
    throw new SyvaAIError('Server AI belum dikonfigurasi.', 'unavailable');
  }
  if (res.status === 429) throw new SyvaAIError('SYVA lagi ramai. Coba lagi sebentar ya.', 'busy');
  if (!res.ok || !res.body) throw new SyvaAIError('SYVA sedang tidak bisa menjawab. Coba lagi nanti.', 'failed');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const data = line.startsWith('data:') ? line.slice(5).trim() : '';
        if (!data || data === '[DONE]') continue;
        try {
          const piece = (JSON.parse(data) as { choices?: { delta?: { content?: string } }[] }).choices?.[0]?.delta?.content;
          if (piece) {
            text += piece;
            onToken?.(text);
          }
        } catch {
          // ignore a partial or non-JSON line
        }
      }
    }
  } catch (e) {
    if (signal?.aborted) throw new SyvaAIError('Dibatalkan', 'abort');
    throw new SyvaAIError('Koneksi terputus saat SYVA menjawab.', 'failed');
  }
  text = text.trim();
  if (!text) throw new SyvaAIError('SYVA belum punya jawaban. Coba tanya dengan cara lain.', 'failed');
  return text;
}

/* ------------------------------------------------------------------- ask */

export interface AskOptions {
  question: string;
  history?: ChatTurn[];
  /** Extra facts the model may use (module text, site facts). */
  context?: string;
  /** Called with the full answer so far while it streams in. */
  onToken?: (textSoFar: string) => void;
  signal?: AbortSignal;
  /** When false, never starts a download: only uses a model that is loaded or already cached. */
  allowDownload?: boolean;
}

/** Ask SYVA a question. Resolves with the full answer, rejects with a SyvaAIError. */
export async function askSyva(options: AskOptions): Promise<string> {
  const { question, history = [], context, onToken, signal, allowDownload = true } = options;

  // 1) The server (Groq) when it is set up; 2) otherwise the on-device model.
  if (await checkServerAI()) {
    try {
      return await askServer(options);
    } catch (e) {
      if (!(e instanceof SyvaAIError && e.kind === 'unavailable')) throw e;
    }
  }

  if (status.phase !== 'ready') {
    if (!allowDownload && !(await isModelCached())) {
      throw new SyvaAIError('SYVA AI belum diaktifkan di perangkat ini.', 'not-ready');
    }
    await prepareSyva();
  }
  const engine = await enginePromise;
  if (!engine) throw new SyvaAIError('SYVA AI belum siap.', 'not-ready');
  if (busy) throw new SyvaAIError('SYVA masih menjawab pertanyaan sebelumnya.', 'busy');

  busy = true;
  try {
    const stream = await engine.chat.completions.create({
      messages: [{ role: 'system', content: buildSystemPrompt(context) }, ...history.slice(-6), { role: 'user', content: question }],
      stream: true,
      temperature: 0.5,
      max_tokens: 220,
    });
    let text = '';
    for await (const chunk of stream) {
      if (signal?.aborted) {
        engine.interruptGenerate();
        throw new SyvaAIError('Dibatalkan', 'abort');
      }
      const piece = chunk.choices[0]?.delta?.content;
      if (piece) {
        text += piece;
        onToken?.(text);
      }
    }
    text = text.trim();
    if (!text) throw new SyvaAIError('SYVA belum punya jawaban. Coba tanya dengan cara lain.', 'failed');
    return text;
  } catch (e) {
    if (e instanceof SyvaAIError) throw e;
    throw new SyvaAIError(e instanceof Error ? e.message : 'SYVA sedang tidak bisa menjawab.', 'failed');
  } finally {
    busy = false;
  }
}
