import { Reveal } from "./Reveal";

const steps = [
  {
    n: "01",
    title: "Citizen spots incident",
    body: "A community member sees a fire, crash, or armed threat near them.",
  },
  {
    n: "02",
    title: "Reports via Omni app",
    body: "One-tap report — type, photo, location auto-attached.",
  },
  {
    n: "03",
    title: "Verified & visualized",
    body: "Trusted moderators triage the report; the live map updates instantly.",
  },
  {
    n: "04",
    title: "Community alerted",
    body: "Verified incidents push to everyone in radius within seconds.",
  },
];

export function Lifecycle() {
  return (
    <section className="border-b border-border py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="rounded-2xl border border-border bg-bg-elev p-6 sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-muted">The Omni Loop</p>
              <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight sm:text-4xl">
                From spot → alert in seconds.
              </h2>
            </div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-fg-subtle">
              4 steps · ~12s median
            </div>
          </div>

          <div className="relative mt-12">
            {/* Connecting dashed line */}
            <div className="absolute left-0 right-0 top-5 hidden h-px border-t border-dashed border-border-strong md:block" aria-hidden />

            <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
              {steps.map((s, idx) => (
                <Reveal as="li" key={s.n} delay={idx * 120} className="relative">
                  <HexNode n={s.n} />
                  <h3 className="mt-5 text-sm font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{s.body}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function HexNode({ n }: { n: string }) {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center">
      <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full" aria-hidden>
        <polygon
          points="20,2 36,11 36,29 20,38 4,29 4,11"
          fill="var(--bg-card)"
          stroke="currentColor"
          strokeWidth="1"
          className="text-border-strong"
        />
      </svg>
      <span className="relative font-mono text-[11px] font-semibold text-fg">{n}</span>
    </div>
  );
}
