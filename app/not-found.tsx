import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you’re looking for doesn’t exist on Kasala.",
  robots: { index: false, follow: false },
};

const destinations = [
  { href: "/", label: "Home", desc: "What Kasala is and how it works" },
  { href: "/#how", label: "How it works", desc: "From spot to alert in seconds" },
  { href: "/#coverage", label: "Coverage", desc: "Where Kasala is live" },
  { href: "/support", label: "Support", desc: "Talk to a real person" },
];

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
        <div className="absolute inset-0 hero-radial" aria-hidden />

        <div className="relative mx-auto max-w-3xl px-5 pb-20 pt-20 sm:pt-28">
          <div className="flex flex-col items-center text-center">
            {/* Off-the-map pill */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-bg-card/60 py-1.5 pl-2 pr-4 text-xs font-medium backdrop-blur">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-danger animate-ping-slow" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-danger" />
              </span>
              <span className="text-danger">SIGNAL LOST</span>
              <span className="text-fg-subtle">·</span>
              <span className="font-mono text-fg-muted">err.404</span>
            </div>

            {/* 4 — pin — 4 */}
            <div className="mt-8 flex items-center gap-3 sm:gap-6">
              <span className="font-mono text-8xl font-semibold tracking-tighter sm:text-9xl">
                4
              </span>
              <DroppedPin />
              <span className="font-mono text-8xl font-semibold tracking-tighter sm:text-9xl">
                4
              </span>
            </div>

            <h1 className="mt-8 max-w-xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Off the map.
            </h1>
            <p className="mt-3 max-w-md text-pretty text-base text-fg-muted">
              We couldn’t find the page you’re looking for. It may have moved, been
              renamed, or never existed in the first place.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-fg px-4 text-sm font-semibold text-bg transition-transform hover:-translate-y-0.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M3 12l9-9 9 9" />
                  <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
                </svg>
                Back to home
              </Link>
              <Link
                href="/support"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-border-strong bg-bg-card px-4 text-sm font-medium hover:bg-bg-elev transition-colors"
              >
                Report a broken link
              </Link>
            </div>
          </div>

          {/* Common destinations */}
          <div className="mt-16">
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
              Try one of these instead
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {destinations.map((d) => (
                <li key={d.href}>
                  <Link
                    href={d.href}
                    className="group flex items-center justify-between rounded-xl border border-border bg-bg-card px-4 py-3.5 transition-colors hover:border-border-strong hover:bg-bg-elev"
                  >
                    <div className="leading-tight">
                      <div className="text-sm font-semibold text-fg">{d.label}</div>
                      <div className="mt-0.5 text-xs text-fg-muted">{d.desc}</div>
                    </div>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-fg"
                      aria-hidden
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Diagnostic footer */}
          <div className="mt-12 flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-wider text-fg-subtle">
            <span>
              <span className="text-danger">●</span> ERR.404
            </span>
            <span>·</span>
            <span>ROUTE.UNRESOLVED</span>
            <span>·</span>
            <span>RECOVERY.AVAILABLE</span>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* A dropped map pin that bobs slightly. */
function DroppedPin() {
  return (
    <span className="relative inline-flex h-24 w-24 items-center justify-center sm:h-32 sm:w-32">
      {/* Pulsing halo */}
      <span
        className="absolute h-full w-full rounded-full animate-ping-slow"
        style={{ background: "color-mix(in oklab, var(--danger) 18%, transparent)" }}
        aria-hidden
      />
      {/* Pin SVG */}
      <svg
        viewBox="0 0 64 64"
        className="relative h-full w-full animate-float"
        aria-hidden
      >
        <defs>
          <radialGradient id="pinGloss" cx="35%" cy="30%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <path
          d="M32 6 C 20 6 12 14 12 26 C 12 38 32 56 32 56 C 32 56 52 38 52 26 C 52 14 44 6 32 6 Z"
          fill="var(--danger)"
          stroke="#ffffff"
          strokeWidth="2"
        />
        <path
          d="M32 6 C 20 6 12 14 12 26 C 12 38 32 56 32 56 C 32 56 52 38 52 26 C 52 14 44 6 32 6 Z"
          fill="url(#pinGloss)"
        />
        <circle cx="32" cy="25" r="6.5" fill="#ffffff" />
        <text
          x="32"
          y="29"
          textAnchor="middle"
          fontFamily="var(--font-geist-mono), monospace"
          fontSize="9"
          fontWeight="700"
          fill="var(--danger)"
        >
          ?
        </text>
      </svg>
    </span>
  );
}
