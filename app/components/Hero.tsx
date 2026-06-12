import { MapPreview } from "./MapPreview";
import { Reveal } from "./Reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
      <div className="absolute inset-0 hero-radial" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-16 sm:pt-28">
        <div className="flex flex-col items-center text-center">
          <Reveal>
            <LivePill />
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-7 max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
              Immediate community safety alerts.{" "}
              <span className="text-fg-muted">Seconds save lives.</span>
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 max-w-xl text-pretty text-base text-fg-muted sm:text-lg">
              Spot, report, and monitor critical incidents in your area in real time. Powering safer
              communities together — wherever you are in the world.
            </p>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              <a
                href="https://apps.apple.com/app/kasala-community-alerts/id6777521404"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-12 items-center gap-3 rounded-lg bg-fg pl-4 pr-5 text-bg transition-transform hover:-translate-y-0.5"
              >
                <AppleIcon />
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] uppercase tracking-wider opacity-70">Download on the</span>
                  <span className="text-sm font-semibold">App Store</span>
                </span>
              </a>
              <a
                href="#android"
                className="group inline-flex h-12 items-center gap-3 rounded-lg bg-fg pl-4 pr-5 text-bg transition-transform hover:-translate-y-0.5"
              >
                <PlayIcon />
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] uppercase tracking-wider opacity-70">Get it on</span>
                  <span className="text-sm font-semibold">Google Play</span>
                </span>
              </a>
            </div>
          </Reveal>

          <Reveal delay={340}>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-fg-muted">
              <TrustItem label="GDPR-ready" />
              <span className="text-fg-subtle">·</span>
              <TrustItem label="Privacy-first" />
              <span className="text-fg-subtle">·</span>
              <TrustItem label="iOS & Android" />
            </div>
          </Reveal>
        </div>

        <Reveal delay={400} className="relative mx-auto mt-16 max-w-5xl">
          <div className="pointer-events-none absolute -inset-x-8 -inset-y-6 bg-gradient-to-b from-transparent via-transparent to-bg" aria-hidden />
          <MapPreview />
        </Reveal>
      </div>
    </section>
  );
}

function LivePill() {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-bg-card/60 py-1.5 pl-2 pr-4 text-xs font-medium backdrop-blur">
      <span className="relative inline-flex h-2 w-2">
        <span className="absolute inset-0 rounded-full bg-ok animate-ping-slow" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-ok animate-pulse-dot" />
      </span>
      <span className="text-ok">NOW AVAILABLE WORLDWIDE</span>
      <span className="text-fg-subtle">·</span>
      <span className="text-fg-muted">iOS &amp; Android</span>
    </div>
  );
}

function TrustItem({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-ok" aria-hidden>
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {label}
    </span>
  );
}

function AppleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 12.04c-.02-2.54 2.07-3.76 2.16-3.82-1.18-1.72-3.01-1.96-3.66-1.99-1.56-.16-3.04.92-3.83.92-.8 0-2.01-.9-3.31-.88-1.7.03-3.27 1-4.14 2.52-1.77 3.07-.45 7.6 1.27 10.09.84 1.22 1.84 2.59 3.14 2.54 1.26-.05 1.74-.81 3.27-.81s1.95.81 3.29.78c1.36-.02 2.22-1.23 3.05-2.46.96-1.41 1.36-2.78 1.38-2.85-.03-.01-2.64-1.01-2.66-4.01zM14.5 4.5c.7-.85 1.17-2.03.99-3.21-1.01.04-2.24.67-2.96 1.51-.65.75-1.22 1.95-1.07 3.11 1.13.09 2.28-.57 3.04-1.41z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 512 512" aria-hidden>
      <path
        d="M11.6 9.4C5.6 15.7 2 25.4 2 38v436c0 12.6 3.6 22.3 9.6 28.6l1.5 1.5L257.6 259v-6L13.1 8z"
        fill="#00D2BD"
      />
      <path
        d="M339 340l-81.4-81.4v-5.2L339 172l1.8 1L437 226c27.5 15.6 27.5 41.2 0 56.8l-96.2 53-1.8 1.2z"
        fill="#FFCC02"
      />
      <path
        d="M340.8 339L256 254 11.6 498.6c9 9.6 24 10.8 41 1.2l288.2-160.8"
        fill="#FF3D44"
      />
      <path
        d="M340.8 173L52.6 9.6c-17-9.6-32-8.4-41 1.2L256 254"
        fill="#00C16C"
      />
    </svg>
  );
}
