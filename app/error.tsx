"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";

/**
 * Global error boundary. Next.js renders this whenever a server or client
 * component throws while rendering — e.g. Supabase times out, a service
 * action fails fatally, an upstream API is down. We treat that as a "503 —
 * service temporarily unavailable" for the user.
 *
 * `error.tsx` must be a client component so React can give us a `reset()`
 * function that re-renders the failed route segment without a full reload.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [tries, setTries] = useState(0);

  useEffect(() => {
    // Log to the console at least — wired up to a real monitoring tool
    // (Sentry, Logflare, etc.) once we add one.
    console.error("Unhandled error:", error);
  }, [error]);

  function tryAgain() {
    setTries((n) => n + 1);
    reset();
  }

  return (
    <>
      <Nav />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
        <div className="absolute inset-0 hero-radial" aria-hidden />

        <div className="relative mx-auto max-w-3xl px-5 pb-20 pt-20 sm:pt-28">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-bg-card/60 py-1.5 pl-2 pr-4 text-xs font-medium backdrop-blur">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-warn animate-ping-slow" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-warn" />
              </span>
              <span className="text-warn">SERVICE INTERRUPTED</span>
              <span className="text-fg-subtle">·</span>
              <span className="font-mono text-fg-muted">err.503</span>
            </div>

            {/* 5 — broken signal — 3 */}
            <div className="mt-8 flex items-center gap-3 sm:gap-6">
              <span className="font-mono text-8xl font-semibold tracking-tighter sm:text-9xl">
                5
              </span>
              <BrokenSignal />
              <span className="font-mono text-8xl font-semibold tracking-tighter sm:text-9xl">
                3
              </span>
            </div>

            <h1 className="mt-8 max-w-xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Service unavailable.
            </h1>
            <p className="mt-3 max-w-md text-pretty text-base text-fg-muted">
              The server is temporarily busy. Give it a moment and try again — your
              report or session hasn’t been lost.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={tryAgain}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-fg px-4 text-sm font-semibold text-bg transition-transform hover:-translate-y-0.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                Try again{tries > 0 ? ` (${tries})` : ""}
              </button>
              <Link
                href="/"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-border-strong bg-bg-card px-4 text-sm font-medium hover:bg-bg-elev transition-colors"
              >
                Back to home
              </Link>
            </div>

            <p className="mt-6 max-w-md text-xs text-fg-muted">
              If this keeps happening,{" "}
              <Link href="/support" className="font-medium text-fg hover:underline">
                let us know
              </Link>
              . Include the reference code below so we can trace it.
            </p>
          </div>

          {/* Reference code + diagnostics */}
          <div className="mx-auto mt-12 max-w-md">
            <div className="rounded-xl border border-border bg-bg-card px-4 py-3.5">
              <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-wider text-fg-subtle">
                <span>Reference</span>
                <span>Time</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-3 font-mono text-xs">
                <span className="text-fg">{error.digest ?? "no-digest"}</span>
                <span className="text-fg-muted">
                  {new Date().toISOString().replace("T", " ").slice(0, 19)} UTC
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-wider text-fg-subtle">
            <span>
              <span className="text-warn">●</span> ERR.503
            </span>
            <span>·</span>
            <span>UPSTREAM.BUSY</span>
            <span>·</span>
            <span>RETRY.SUGGESTED</span>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* A jittery wifi/signal icon with the top arc broken. */
function BrokenSignal() {
  return (
    <span className="relative inline-flex h-24 w-24 items-center justify-center sm:h-32 sm:w-32">
      <span
        className="absolute h-full w-full rounded-full animate-ping-slow"
        style={{ background: "color-mix(in oklab, var(--warn) 18%, transparent)" }}
        aria-hidden
      />
      <svg viewBox="0 0 64 64" className="relative h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="sigGloss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        {/* Outer arc — broken */}
        <path
          d="M 8 32 A 24 24 0 0 1 26 12"
          fill="none"
          stroke="var(--warn)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 38 12 A 24 24 0 0 1 56 32"
          fill="none"
          stroke="var(--warn)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Middle arc — intact */}
        <path
          d="M 16 36 A 16 16 0 0 1 48 36"
          fill="none"
          stroke="var(--warn)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.65"
        />

        {/* Inner arc */}
        <path
          d="M 24 40 A 8 8 0 0 1 40 40"
          fill="none"
          stroke="var(--warn)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.45"
        />

        {/* Dot */}
        <circle cx="32" cy="46" r="3.5" fill="var(--warn)" />

        {/* Slash through the gap to emphasize the break */}
        <line
          x1="28"
          y1="8"
          x2="36"
          y2="16"
          stroke="var(--danger)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <rect x="0" y="0" width="64" height="64" fill="url(#sigGloss)" />
      </svg>
    </span>
  );
}
