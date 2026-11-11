import { buildSystemPrompt } from '@/lib/syva-prompt';

/**
 * Server side of SYVA's AI (Groq). The API key lives only in GROQ_API_KEY
 * (.env.local) and never reaches the browser. The system prompt is built here,
 * and every input is size-limited, so this endpoint cannot be used as a free
 * general-purpose proxy for the key.
 */

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Ids available on this Groq account (checked against /openai/v1/models). Both are
// reasoning models, so the request below keeps reasoning short for fast answers.
const MODELS = [process.env.GROQ_MODEL, 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'].filter((m): m is string => Boolean(m));

const MAX_QUESTION = 500;
const MAX_CONTEXT = 2500;
const MAX_HISTORY = 6;
const MAX_TURN = 800;

// Small per-IP limit (in memory): enough to stop a loop, not a substitute for Groq's own limits.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, { count: number; reset: number }>();

function limited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    if (hits.size > 500) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

const json = (body: unknown, status: number) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/** Lets the client know whether server AI is set up (no secrets in the answer). */
export async function GET() {
  return json({ configured: Boolean(process.env.GROQ_API_KEY) }, 200);
}

type Turn = { role: 'user' | 'assistant'; content: string };

export async function POST(request: Request) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return json({ error: 'not-configured' }, 503);

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (limited(ip)) return json({ error: 'rate-limited' }, 429);

  let body: { question?: unknown; history?: unknown; context?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad-request' }, 400);
  }

  const question = typeof body.question === 'string' ? body.question.trim().slice(0, MAX_QUESTION) : '';
  if (!question) return json({ error: 'bad-request' }, 400);
  const context = typeof body.context === 'string' ? body.context.slice(0, MAX_CONTEXT) : undefined;
  const history: Turn[] = (Array.isArray(body.history) ? body.history : [])
    .filter(
      (t): t is Turn =>
        !!t && typeof t === 'object' && (t.role === 'user' || t.role === 'assistant') && typeof t.content === 'string'
    )
    .slice(-MAX_HISTORY)
    .map((t) => ({ role: t.role, content: t.content.slice(0, MAX_TURN) }));

  const messages = [{ role: 'system', content: buildSystemPrompt(context) }, ...history, { role: 'user', content: question }];

  for (const model of MODELS) {
    let upstream: Response;
    try {
      upstream = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          temperature: 0.5,
          reasoning_effort: 'low',
          max_completion_tokens: 600, // includes the short reasoning, not just the visible answer
        }),
        signal: AbortSignal.timeout(30_000),
      });
    } catch {
      return json({ error: 'upstream-unreachable' }, 502);
    }

    if (upstream.ok && upstream.body) {
      return new Response(upstream.body, {
        headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store' },
      });
    }
    if (upstream.status === 401 || upstream.status === 403) return json({ error: 'bad-key' }, 502);
    if (upstream.status === 429) return json({ error: 'rate-limited' }, 429);
    // 400/404 usually means that model id is unavailable: try the next one.
  }
  return json({ error: 'model-unavailable' }, 502);
}
