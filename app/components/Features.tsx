import { Reveal } from "./Reveal";

const features = [
  {
    accent: "var(--info)",
    tag: "AUTO-GPS",
    title: "Instant Reporting",
    body: "Report bandits, car crashes, fires, and medical emergencies instantly with automatic GPS marking — no typing, no waiting.",
    icon: <PinIcon />,
  },
  {
    accent: "var(--danger)",
    tag: "PUSH",
    title: "Real-time Alerts",
    body: "Receive immediate push notifications when verified incidents occur near you. Tune your radius — 500m or 5km.",
    icon: <BellIcon />,
  },
  {
    accent: "var(--ok)",
    tag: "COMMUNITY VERIFIED",
    title: "Verified Response",
    body: "Community moderators and trusted reporters cross-check every report to filter false alarms before alerts go out.",
    icon: <ShieldIcon />,
  },
];

export function Features() {
  return (
    <section id="how" className="border-b border-border py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-muted">How Omni Works</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Built for the moments when every second counts.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {features.map((f, idx) => (
            <Reveal
              key={f.title}
              as="article"
              delay={idx * 100}
              className="group relative overflow-hidden rounded-xl border border-border bg-bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-border-strong hover:bg-bg-card/80"
            >
              <span
                className="absolute inset-x-0 top-0 h-px"
                style={{ background: `linear-gradient(to right, transparent, ${f.accent}, transparent)` }}
                aria-hidden
              />
              <div className="flex items-start justify-between">
                <span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-elev text-fg"
                  style={{ color: f.accent }}
                >
                  {f.icon}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-fg-subtle">
                  {f.tag}
                </span>
              </div>
              <h3 className="mt-8 text-lg font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{f.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
