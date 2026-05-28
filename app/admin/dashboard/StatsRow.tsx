import type { Incident } from "../_lib/incidents";

export function StatsRow({ incidents }: { incidents: Incident[] }) {
  const count = (s: Incident["status"]) =>
    incidents.filter((i) => i.status === s).length;

  const stats = [
    { value: count("active"), label: "Active", color: "var(--danger)", pulse: true },
    { value: count("investigating"), label: "Investigating", color: "var(--warn)" },
    { value: count("resolved"), label: "Resolved (24h)", color: "var(--ok)" },
    { value: count("false_alarm"), label: "False alarm", color: "var(--info)" },
  ];

  return (
    <div className="sticky top-16 z-40 flex items-center gap-6 border-b border-border bg-bg-card/95 px-5 py-5 backdrop-blur">
      <div className="grid flex-1 grid-cols-2 gap-x-10 gap-y-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-start gap-3">
            <span className="relative mt-1.5 inline-flex h-2 w-2 shrink-0">
              {s.pulse && (
                <span
                  className="absolute inset-0 rounded-full animate-ping-slow"
                  style={{ background: s.color }}
                />
              )}
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ background: s.color }}
              />
            </span>
            <div className="leading-none">
              <div className="text-3xl font-semibold tracking-tight">{s.value}</div>
              <div className="mt-2 text-xs text-fg-muted">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden items-center gap-3 lg:flex">
        <div className="text-right leading-tight">
          <div className="text-[10px] uppercase tracking-wider text-fg-subtle">Last sync</div>
          <div className="font-mono text-xs text-fg-muted">just now</div>
        </div>
        <button
          aria-label="Refresh"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-fg-muted hover:text-fg hover:border-border-strong transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
