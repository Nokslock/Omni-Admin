import { Reveal } from "./Reveal";

const features = [
  {
    n: "01",
    accent: "#2563eb",
    tag: "AUTO-GPS",
    title: "Instant Reporting",
    body: "Report fires, crashes, armed threats, and medical emergencies in one tap — your location attaches itself, so there's nothing to type when seconds matter.",
    points: ["One-tap categories", "GPS auto-pin", "Photo optional"],
    icon: <PinIcon />,
  },
  {
    n: "02",
    accent: "#ef4444",
    tag: "REAL-TIME PUSH",
    title: "Alerts That Reach You",
    body: "The moment a verified incident lands inside your radius, you get a push — even with the app closed. Tune your range from 500m to 50km.",
    points: ["Background alerts", "Custom radius", "Critical wake-screen"],
    icon: <BellIcon />,
  },
  {
    n: "03",
    accent: "#16a34a",
    tag: "COMMUNITY VERIFIED",
    title: "Verified, Not Noisy",
    body: "Every report is cross-checked by nearby reporters and moderators. Confirmations raise trust, false flags pull it down — so your feed stays signal, not noise.",
    points: ["Confirm / flag", "Trust scoring", "Moderator triage"],
    icon: <ShieldIcon />,
  },
];

export function Features() {
  return (
    <section id="how" className="relative overflow-hidden border-b border-border py-24">
      <div className="absolute inset-0 glow-soft opacity-60" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-muted">How Kasala Works</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Built for the moments when every second counts.
          </h2>
          <p className="mt-5 text-pretty text-base text-fg-muted">
            Three things have to happen fast — report, verify, alert. Kasala makes each one effortless.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {features.map((f, idx) => (
            <Reveal
              key={f.title}
              as="article"
              delay={idx * 100}
              className="group relative overflow-hidden rounded-2xl border border-border bg-bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-border-strong"
            >
              {/* corner accent glow */}
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-30 blur-2xl transition-opacity duration-300 group-hover:opacity-60"
                style={{ background: f.accent }}
                aria-hidden
              />
              {/* top accent line */}
              <span
                className="absolute inset-x-0 top-0 h-px"
                style={{ background: `linear-gradient(to right, transparent, ${f.accent}, transparent)` }}
                aria-hidden
              />
              {/* ghost number */}
              <span
                className="pointer-events-none absolute right-5 top-3 font-mono text-5xl font-bold leading-none text-fg/[0.04]"
                aria-hidden
              >
                {f.n}
              </span>

              <div className="relative">
                <span
                  className="inline-flex h-12 w-12 items-center justify-center rounded-xl border"
                  style={{
                    color: f.accent,
                    borderColor: `color-mix(in oklab, ${f.accent} 35%, transparent)`,
                    background: `color-mix(in oklab, ${f.accent} 12%, transparent)`,
                    boxShadow: `0 0 28px color-mix(in oklab, ${f.accent} 22%, transparent)`,
                  }}
                >
                  {f.icon}
                </span>

                <div className="mt-7 flex items-center gap-2">
                  <h3 className="text-lg font-semibold tracking-tight">{f.title}</h3>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-fg-muted">{f.body}</p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {f.points.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-elev px-2.5 py-1 text-[11px] font-medium text-fg-muted"
                    >
                      <span className="h-1 w-1 rounded-full" style={{ background: f.accent }} />
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PinIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
