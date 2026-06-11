import { Reveal } from "./Reveal";
import { AppDemo } from "./AppDemo";

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

        <Reveal delay={200} className="mt-20 grid gap-6 sm:grid-cols-3">
          {[
            { k: "Auto-GPS", v: "Location attaches itself. No typing required." },
            { k: "Offline-safe", v: "Reports queue if signal drops and send when you reconnect." },
            { k: "Anonymous", v: "Your identity is never shared with other reporters." },
          ].map((b) => (
            <div key={b.k} className="rounded-lg border border-border bg-bg-card p-5">
              <div className="font-mono text-[10px] uppercase tracking-wider text-fg-subtle">{b.k}</div>
              <div className="mt-2 text-sm leading-relaxed text-fg-muted">{b.v}</div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
