import { Reveal } from "./Reveal";

const free = [
  "Alerts within up to 20 km",
  "Report with a photo from the scene",
  "Live map, Alerts feed and weekly digest",
  "Comments, likes and coin gifts",
  "Missing-person broadcasts",
];

const pro = [
  "Alerts up to 60 km away",
  "Saved places, each with its own alerts",
  "Family location sharing",
  "Notes on your reports",
  "Instant verification for your reports",
  "Gold Pro badge",
  "No ads",
];

export function ProSection() {
  return (
    <section id="pro" className="relative overflow-hidden border-b border-border py-24">
      <div className="absolute inset-0 bg-grid opacity-25" aria-hidden />
      <div className="relative mx-auto max-w-5xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-muted">Kasala Pro</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Free for everyone. Pro when you want more.
          </h2>
          <p className="mt-5 text-pretty text-base text-fg-muted">
            Kasala&rsquo;s safety alerts are free for everyone. Pro adds wider coverage, the
            people and places you care about, and an ad-free feed.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <Reveal className="rounded-2xl border border-border bg-bg-card p-7">
            <div className="text-sm font-semibold uppercase tracking-wider text-fg-muted">Free</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">For everyone</div>
            <ul className="mt-6 space-y-2.5 text-sm">
              {free.map((f) => (
                <Item key={f} color="var(--ok)">{f}</Item>
              ))}
            </ul>
          </Reveal>

          <Reveal
            delay={100}
            className="relative overflow-hidden rounded-2xl border border-[#e0a526]/50 bg-bg-card p-7"
          >
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-25 blur-3xl"
              style={{ background: "#e0a526" }}
              aria-hidden
            />
            <div className="relative flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#e0a526]">
              <ProBadge /> Pro
            </div>
            <div className="relative mt-2 text-3xl font-semibold tracking-tight">7 days free</div>
            <p className="relative mt-1 text-xs text-fg-muted">
              Then monthly or yearly, at the price shown in the App Store or Google Play. Cancel
              any time in your store settings.
            </p>
            <ul className="relative mt-6 space-y-2.5 text-sm">
              <li className="text-fg-muted">Everything in Free, plus:</li>
              {pro.map((f) => (
                <Item key={f} color="#e0a526">{f}</Item>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Item({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0" aria-hidden>
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>{children}</span>
    </li>
  );
}

function ProBadge() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 1.5l2.6 2.1 3.3-.4 1 3.2 2.8 1.8-1 3.2 1 3.2-2.8 1.8-1 3.2-3.3-.4L12 22.5l-2.6-2.1-3.3.4-1-3.2-2.8-1.8 1-3.2-1-3.2 2.8-1.8 1-3.2 3.3.4z"
        fill="#e0a526"
      />
      <path d="M8 12.2l2.6 2.6L16 9.4" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
