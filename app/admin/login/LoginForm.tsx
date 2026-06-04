"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInAdmin } from "./actions";

export function LoginForm({ initialError = null }: { initialError?: string | null }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await signInAdmin(email, password);

    if ("error" in result) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    router.replace("/admin/dashboard");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="text-xs font-medium text-fg-muted">
          Work email
        </label>
        <div className="relative mt-2">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-fg-subtle">
            <MailIcon />
          </span>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="a.bello@kasalaalert.com"
            className="h-11 w-full rounded-lg border border-border bg-bg-elev pl-10 pr-3 text-sm text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none focus:ring-1 focus:ring-fg-muted/30 transition-colors"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-xs font-medium text-fg-muted">
            Password
          </label>
          <a href="#forgot" className="text-xs font-medium text-fg hover:underline">
            Forgot password?
          </a>
        </div>
        <div className="relative mt-2">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-fg-subtle">
            <LockIcon />
          </span>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••"
            className="h-11 w-full rounded-lg border border-border bg-bg-elev pl-10 pr-10 text-sm text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none focus:ring-1 focus:ring-fg-muted/30 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-fg-subtle hover:text-fg transition-colors"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      <label className="flex cursor-pointer select-none items-center gap-2.5 text-xs text-fg-muted">
        <span className="relative inline-flex">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="peer sr-only"
          />
          <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-border-strong bg-bg-elev peer-checked:border-fg peer-checked:bg-fg transition-colors">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-bg ${remember ? "opacity-100" : "opacity-0"} transition-opacity`}
              aria-hidden
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        </span>
        Remember this device for 7 days
      </label>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2.5 text-xs font-medium text-danger"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="relative flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-fg text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Spinner />
            Signing in…
          </>
        ) : (
          "Sign in to Kasala"
        )}
      </button>
    </form>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.79 19.79 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.86 19.86 0 0 1-3.17 4.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.9s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}
