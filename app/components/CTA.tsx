import { Reveal } from "./Reveal";

export function CTA() {
  return (
    <section className="border-b border-border py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="relative overflow-hidden rounded-3xl border border-border-strong bg-bg-card">
          {/* layered glows */}
          <div className="absolute inset-0 sheen opacity-[0.18]" aria-hidden />
          <div className="absolute inset-0 noise opacity-[0.15] mix-blend-overlay" aria-hidden />
          <div
            className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
            style={{ background: "var(--danger)" }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
            style={{ background: "var(--info)" }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />

          <div className="relative flex flex-col items-center px-6 py-16 text-center sm:px-12 sm:py-20">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-bg-elev/70 py-1.5 pl-2 pr-4 text-xs font-medium backdrop-blur">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-ok animate-ping-slow" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-ok animate-pulse-dot" />
              </span>
              <span className="text-fg-muted">Live in your region · iOS &amp; Android</span>
            </div>

            <h2 className="mt-7 max-w-2xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Be the first to know.{" "}
              <span className="text-fg-muted">Before it reaches you.</span>
            </h2>
            <p className="mt-5 max-w-lg text-pretty text-base text-fg-muted sm:text-lg">
              Join a growing network of people keeping each other safe — wherever they are in the world.
              It takes thirty seconds to set up.
            </p>

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

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-fg-muted">
              <Trust label="Free to start" />
              <span className="text-fg-subtle">·</span>
              <Trust label="GDPR-ready" />
              <span className="text-fg-subtle">·</span>
              <Trust label="No account needed to browse" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Trust({ label }: { label: string }) {
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
      <path d="M11.6 9.4C5.6 15.7 2 25.4 2 38v436c0 12.6 3.6 22.3 9.6 28.6l1.5 1.5L257.6 259v-6L13.1 8z" fill="#00D2BD" />
      <path d="M339 340l-81.4-81.4v-5.2L339 172l1.8 1L437 226c27.5 15.6 27.5 41.2 0 56.8l-96.2 53-1.8 1.2z" fill="#FFCC02" />
      <path d="M340.8 339L256 254 11.6 498.6c9 9.6 24 10.8 41 1.2l288.2-160.8" fill="#FF3D44" />
      <path d="M340.8 173L52.6 9.6c-17-9.6-32-8.4-41 1.2L256 254" fill="#00C16C" />
    </svg>
  );
}
