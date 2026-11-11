import { Hand } from 'lucide-react';

/** Pin chip anchored by percentage to the model; `dot` is the marker, the label sits beside it. */
function Pin({ label, className }: { label: string; className: string }) {
  return (
    <span className={`absolute flex items-center gap-2 ${className}`}>
      <span aria-hidden className="relative flex h-3 w-3">
        <span className="absolute inset-0 rounded-full bg-glow/40 motion-safe:animate-ping" />
        <span className="relative h-3 w-3 rounded-full border-2 border-ink-deep bg-glow" />
      </span>
      <span className="rounded-full border border-line bg-surface px-2.5 py-0.5 font-mono text-[11px] text-white">
        {label}
      </span>
    </span>
  );
}

/** Illustration of the student lab: a model, its pins and the hand gesture. Decorative only. */
export default function LabMock() {
  return (
    <div
      aria-hidden
      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-ink-deep bg-[radial-gradient(circle_at_50%_55%,#3836a8_0%,transparent_65%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
    >
      {/* HUD */}
      <div className="absolute left-3 top-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-mist">
        <span className="h-2 w-2 rounded-full bg-flame" />
        Lab Siswa · PC Gaming
      </div>

      {/* Orbit rings + isometric block */}
      <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full">
        <ellipse cx="200" cy="165" rx="170" ry="52" fill="none" stroke="#9da3f7" strokeOpacity=".35" strokeDasharray="3 6" />
        <ellipse cx="200" cy="165" rx="120" ry="36" fill="none" stroke="#9da3f7" strokeOpacity=".25" />
        <g className="origin-center motion-safe:animate-[spin_40s_linear_infinite]" style={{ transformOrigin: '200px 150px', transformBox: 'view-box' }}>
          <ellipse cx="200" cy="150" rx="148" ry="148" fill="none" stroke="#3fefff" strokeOpacity=".18" strokeDasharray="1 9" strokeLinecap="round" strokeWidth="2" />
        </g>
        {/* shadow */}
        <ellipse cx="200" cy="222" rx="70" ry="12" fill="#1f1c6b" opacity=".7" />
        {/* case: left, right, top faces */}
        <polygon points="140,120 200,150 200,220 140,190" fill="#4347c6" />
        <polygon points="200,150 260,120 260,190 200,220" fill="#3836a8" />
        <polygon points="140,120 200,90 260,120 200,150" fill="#5559d9" />
        {/* glass panel + RGB strip */}
        <polygon points="150,132 190,152 190,206 150,186" fill="#1f1c6b" opacity=".85" />
        <polygon points="157,148 183,161 183,166 157,153" fill="#3fefff" />
        <polygon points="157,166 183,179 183,184 157,171" fill="#ff7a1f" />
      </svg>

      <Pin label="GPU" className="left-[24%] top-[52%]" />
      <Pin label="CPU" className="left-[62%] top-[36%]" />
      <Pin label="RAM" className="left-[66%] top-[60%]" />

      {/* Gesture indicator */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-1.5 pr-3.5 text-xs font-semibold text-white">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-flame text-ink-deep">
          <Hand className="h-4 w-4" />
        </span>
        5 jari terbuka · putar model
      </div>
    </div>
  );
}
