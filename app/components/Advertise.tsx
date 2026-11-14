import { Reveal } from "./Reveal";

export function Advertise() {
  return (
    <section id="advertise" className="relative overflow-hidden border-b border-border py-24">
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-muted">For local businesses</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Reach your neighbourhood, where it&rsquo;s paying attention.
          </h2>
          <p className="mt-5 max-w-md text-pretty text-base text-fg-muted">
            Put your business in front of people in your area, right in their Alerts feed. Ads
            sit between reports — never above an emergency — and are always labelled Sponsored.
          </p>
          <ul className="mt-6 space-y-2.5 text-sm text-fg-muted">
            <Step n="1">Open Kasala, tap <b className="text-fg">Request</b>, then <b className="text-fg">Advertise</b>.</Step>
            <Step n="2">Choose a sponsored card (logo, headline, button) or your own 2:1 banner.</Step>
            <Step n="3">Our team reviews it and gets in touch about dates and pricing.</Step>
          </ul>
          <a
            href="mailto:support@kasalaalert.com?subject=Advertising"
            className="mt-8 inline-flex h-11 items-center rounded-lg border border-border-strong px-5 text-sm font-semibold hover:bg-bg-elev"
          >
            Talk to us about advertising
          </a>
        </Reveal>

        <Reveal delay={120} className="space-y-4">
          <div className="rounded-2xl border border-border-strong bg-bg-card p-4 shadow-xl">
            <span className="inline-block rounded-md bg-bg-elev px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-fg-muted">
              Sponsored
            </span>
            <div className="mt-3 flex gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-elev text-base font-bold text-fg-muted">
                O
              </span>
              <div className="min-w-0">
                <div className="text-xs text-fg-muted">Ola&rsquo;s Pharmacy</div>
                <div className="mt-0.5 text-[15px] font-bold leading-snug">Open late, two streets away</div>
                <p className="mt-1 text-[13px] leading-snug text-fg-muted">
                  Prescriptions, first aid and essentials until midnight.
                </p>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <span className="inline-flex h-9 items-center rounded-full border border-border-strong px-4 text-[13px] font-semibold">
                Get directions ↗
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-border-strong bg-bg-card p-3 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-md bg-bg-elev px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-fg-muted">
                Sponsored
              </span>
              <span className="text-xs text-fg-muted">Home Security Co.</span>
            </div>
            <div className="mt-2.5 flex aspect-[2/1] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#0ea5e9] p-6 text-center text-white">
              <div>
                <div className="text-xl font-bold leading-tight sm:text-2xl">Cameras installed this week</div>
                <div className="mt-1 text-sm opacity-90">Your banner, your design · 2:1</div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Step({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border font-mono text-[11px] text-fg">
        {n}
      </span>
      <span className="pt-0.5">{children}</span>
    </li>
  );
}
