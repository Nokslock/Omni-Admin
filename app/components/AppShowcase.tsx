import { Reveal } from "./Reveal";
import { AppDemo } from "./AppDemo";

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function WifiOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
    </svg>
  );
}
function MaskIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 8c0-1 1-2 3-2 2.5 0 3.5 1.5 6 1.5S17.5 6 20 6c2 0 3 1 3 2v3c0 4-4 7-11 7S2 15 2 11z" />
      <circle cx="8" cy="11" r="1.2" />
      <circle cx="16" cy="11" r="1.2" />
    </svg>
  );
}

export function AppShowcase() {
  return (
    <section id="app" className="relative overflow-hidden border-b border-border py-28">
      <div className="absolute inset-0 bg-grid opacity-30" aria-hidden />
      <div
        className="absolute inset-x-0 top-1/3 mx-auto h-[420px] w-[80%] max-w-3xl rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(ellipse, color-mix(in oklab, var(--danger) 22%, transparent), transparent 60%)" }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-muted">How to use Kasala</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
              Four taps from bystander to lifesaver.
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 text-pretty text-base text-fg-muted">
              Built to be fast under pressure — big targets, no menus, no logins to bury the moment.
              Tap through to see exactly how it works.
            </p>
          </Reveal>
        </div>

        <Reveal delay={200} className="mt-16 block">
          <AppDemo />
        </Reveal>

        <Reveal delay={200} className="mt-20 grid gap-5 sm:grid-cols-3">
          {[
            { k: "Auto-GPS", v: "Location attaches itself. No typing required.", accent: "#2563eb", icon: <PinIcon /> },
            { k: "Offline-safe", v: "Reports queue if signal drops and send when you reconnect.", accent: "#16a34a", icon: <WifiOffIcon /> },
            { k: "Anonymous", v: "Your identity is never shared with other reporters.", accent: "#a855f7", icon: <MaskIcon /> },
          ].map((b) => (
            <div
              key={b.k}
              className="group relative overflow-hidden rounded-xl border border-border bg-bg-card p-5 transition-colors hover:border-border-strong"
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
                style={{ background: b.accent }}
                aria-hidden
              />
              <span
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ color: b.accent, background: `color-mix(in oklab, ${b.accent} 14%, transparent)` }}
              >
                {b.icon}
              </span>
              <div className="relative mt-4 font-mono text-[10px] uppercase tracking-wider text-fg-subtle">{b.k}</div>
              <div className="relative mt-1.5 text-sm leading-relaxed text-fg-muted">{b.v}</div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
