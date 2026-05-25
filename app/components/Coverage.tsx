const cities = [
  { name: "Lagos", status: "live", reporters: "4,218" },
  { name: "Abuja", status: "soon", reporters: "Q3 2026" },
  { name: "Port Harcourt", status: "soon", reporters: "Q3 2026" },
  { name: "Ibadan", status: "soon", reporters: "Q4 2026" },
  { name: "Kano", status: "planned", reporters: "2027" },
  { name: "Benin City", status: "planned", reporters: "2027" },
];

export function Coverage() {
  return (
    <section id="coverage" className="border-b border-border py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-muted">Coverage</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Live in Lagos. Rolling out across Nigeria.
            </h2>
            <p className="mt-5 max-w-md text-pretty text-base text-fg-muted">
              We&apos;re activating one city at a time so every Omni community starts with enough
              reporters to make alerts meaningful from day one.
            </p>
            <a
              href="#waitlist"
              className="mt-7 inline-flex h-10 items-center rounded-md border border-border-strong px-4 text-sm font-medium hover:bg-bg-elev transition-colors"
            >
              Request your city →
            </a>
          </div>

          <div className="rounded-xl border border-border bg-bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-fg-muted">
                Rollout map
              </span>
              <span className="font-mono text-[11px] text-fg-subtle">06 cities</span>
            </div>
            <ul className="divide-y divide-border">
              {cities.map((c) => (
                <li key={c.name} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <StatusDot status={c.status} />
                    <span className="text-sm font-medium">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-fg-muted">{c.reporters}</span>
                    <StatusLabel status={c.status} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusDot({ status }: { status: string }) {
  if (status === "live") {
    return (
      <span className="relative inline-flex h-2 w-2">
        <span className="absolute inset-0 rounded-full bg-ok animate-ping-slow" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
      </span>
    );
  }
  if (status === "soon") {
    return <span className="inline-block h-2 w-2 rounded-full bg-warn" />;
  }
  return <span className="inline-block h-2 w-2 rounded-full bg-fg-subtle" />;
}

function StatusLabel({ status }: { status: string }) {
  const map = {
    live: { label: "LIVE", className: "text-ok border-ok/30 bg-ok/10" },
    soon: { label: "SOON", className: "text-warn border-warn/30 bg-warn/10" },
    planned: { label: "PLANNED", className: "text-fg-subtle border-border bg-bg-elev" },
  } as const;
  const m = map[status as keyof typeof map];
  return (
    <span className={`inline-flex h-5 items-center rounded border px-1.5 font-mono text-[9px] font-semibold tracking-wider ${m.className}`}>
      {m.label}
    </span>
  );
}
