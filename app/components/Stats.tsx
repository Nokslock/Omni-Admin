import { CountUp } from "./CountUp";
import { Reveal } from "./Reveal";

const stats = [
  { value: 12, suffix: "s", label: "Median report-to-alert", accent: "#ef4444", icon: <BoltIcon /> },
  { value: 4218, suffix: "", label: "Reporters worldwide", accent: "#2563eb", icon: <UsersIcon /> },
  { value: 98.4, suffix: "%", decimals: 1, label: "Verification accuracy", accent: "#16a34a", icon: <CheckIcon /> },
  { value: 37621, suffix: "", label: "Incidents reported", accent: "#f59e0b", icon: <SirenIcon /> },
];

export function Stats() {
  return (
    <section className="relative overflow-hidden border-b border-border py-px">
      <div className="absolute inset-0 glow-soft opacity-50" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-5 py-12">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {stats.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 80}
              className="group relative overflow-hidden rounded-2xl border border-border bg-bg-card p-5 transition-colors hover:border-border-strong sm:p-6"
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-25 blur-2xl transition-opacity group-hover:opacity-50"
                style={{ background: s.accent }}
                aria-hidden
              />
              <div className="relative flex items-center justify-between">
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    color: s.accent,
                    background: `color-mix(in oklab, ${s.accent} 14%, transparent)`,
                  }}
                >
                  {s.icon}
                </span>
              </div>
              <div className="relative mt-4 font-mono text-3xl font-semibold tracking-tight sm:text-4xl">
                <CountUp to={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} />
              </div>
              <div className="relative mt-1.5 text-xs uppercase tracking-wider text-fg-muted">
                {s.label}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function BoltIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function SirenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 18v-6a5 5 0 0 1 10 0v6" />
      <path d="M5 21h14" />
      <path d="M12 2v1M4.2 6.2l.8.8M19.8 6.2l-.8.8" />
    </svg>
  );
}
