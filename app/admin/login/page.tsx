import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin Sign In — Omni",
  description: "Sign in to the Omni admin portal.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const initialError =
    error === "not_admin" ? "This account doesn't have admin access." : null;

  return (
    <div className="relative flex min-h-dvh flex-col bg-bg text-fg">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{
          background:
            "radial-gradient(ellipse 50% 100% at 50% 0%, color-mix(in oklab, var(--danger) 12%, transparent), transparent 70%)",
        }}
        aria-hidden
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <LogoMark />
          <span>Omni</span>
        </Link>
        <div className="text-xs text-fg-muted">
          Not an admin?{" "}
          <Link href="/" className="font-medium text-fg hover:underline">
            Back to home →
          </Link>
        </div>
      </header>

      {/* Card */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-8">
        <div className="login-card w-full max-w-md rounded-2xl border border-border-strong bg-bg-card/90 p-7 shadow-2xl shadow-black/40 backdrop-blur sm:p-9">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border-strong bg-bg-elev">
              <ShieldIcon />
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight">Admin Portal Access</h1>
            <p className="mt-1.5 text-sm text-fg-muted">
              Sign in with your operator credentials to continue.
            </p>
          </div>

          <div className="mt-7">
            <LoginForm initialError={initialError} />
          </div>

          <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-border bg-bg-elev/50 px-3.5 py-3 text-[11px] leading-relaxed text-fg-muted">
            <InfoIcon />
            <span>
              Restricted to authorized personnel. All session activity is logged and reviewed under
              NDPR Schedule 2.
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex flex-col items-center justify-between gap-2 px-6 py-5 text-[11px] text-fg-subtle md:flex-row">
        <div>© {new Date().getFullYear()} Omni Technologies Ltd.</div>
        <div className="font-mono">v0.1.0 · build 7f3a92</div>
        <div className="inline-flex items-center gap-1.5">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-ok animate-ping-slow" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ok" />
          </span>
          All systems operational
        </div>
      </footer>
    </div>
  );
}

function LogoMark() {
  return (
    <span className="relative inline-flex h-5 w-5 items-center justify-center">
      <span className="absolute inset-0 rounded-full border border-fg" />
      <span className="h-1.5 w-1.5 rounded-full bg-fg" />
    </span>
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

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-px shrink-0 text-fg-subtle" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
