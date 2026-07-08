"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  sendBroadcast,
  type BroadcastAudience,
  type BroadcastSeverity,
} from "./actions";
import { COUNTRIES, WORLDWIDE, countryLabel } from "@/app/lib/countries";

const fieldClass =
  "h-10 w-full rounded-lg border border-border bg-bg-elev px-3 text-sm text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none focus:ring-1 focus:ring-fg-muted/30";

const severityOptions: { value: BroadcastSeverity; label: string; color: string; hint: string }[] = [
  { value: "info", label: "Info", color: "#60a5fa", hint: "General announcement" },
  { value: "warning", label: "Warning", color: "#fbbf24", hint: "Heads-up users should act on" },
  { value: "critical", label: "Critical", color: "#f87171", hint: "Urgent — high priority" },
];

const audienceOptions: { value: BroadcastAudience; label: string; hint: string }[] = [
  { value: "all", label: "Everyone", hint: "All app users and admins" },
  { value: "users", label: "Users only", hint: "Regular mobile users (excludes admins)" },
  { value: "admins", label: "Admins only", hint: "Other admins of this dashboard" },
];

// How long the broadcast stays live in the app feed. null = never expires.
const durationOptions: { value: number | null; label: string }[] = [
  { value: 1, label: "1 hour" },
  { value: 6, label: "6 hours" },
  { value: 12, label: "12 hours" },
  { value: 24, label: "24 hours" },
  { value: 72, label: "3 days" },
  { value: 168, label: "7 days" },
  { value: null, label: "No expiry" },
];

export function BroadcastModal({
  variant = "secondary",
  label = "Broadcast",
}: {
  variant?: "primary" | "secondary";
  label?: string;
} = {}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [severity, setSeverity] = useState<BroadcastSeverity>("info");
  const [audience, setAudience] = useState<BroadcastAudience>("all");
  const [country, setCountry] = useState<string>(WORLDWIDE);
  const [durationHours, setDurationHours] = useState<number | null>(24);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function resetForm() {
    setTitle("");
    setBody("");
    setSeverity("info");
    setAudience("all");
    setCountry(WORLDWIDE);
    setDurationHours(24);
    setError(null);
    setSuccess(null);
  }

  function close() {
    setOpen(false);
    // Wait for the close animation/transition before clearing — feels less jumpy.
    setTimeout(resetForm, 200);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    const res = await sendBroadcast({ title, body, severity, audience, country, durationHours });
    setSubmitting(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    setSuccess(
      country === WORLDWIDE
        ? "Broadcast sent worldwide. Mobile users will see it on their next sync."
        : `Broadcast sent to ${countryLabel(country)}. Mobile users there will see it on their next sync.`,
    );
    setTitle("");
    setBody("");
    // Pull the freshly-inserted broadcast into any list on the page.
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          variant === "primary"
            ? "inline-flex h-10 items-center gap-2 rounded-lg bg-fg px-4 text-sm font-semibold text-bg hover:opacity-90 transition-opacity"
            : "inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-bg-card px-4 text-sm font-medium hover:border-border-strong transition-colors"
        }
      >
        <MailIcon />
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="my-8 w-full max-w-lg rounded-2xl border border-border bg-bg-card shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Send broadcast</h2>
                <p className="text-xs text-fg-muted">
                  Pushed to the mobile app feed for the selected audience.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-muted hover:bg-bg-elev hover:text-fg transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={onSubmit} className="px-6 py-5">
              <div className="space-y-4">
                <Field label="Title" hint={`${title.length}/120`}>
                  <input
                    name="title"
                    required
                    maxLength={120}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Flood warning in Lekki Phase 1"
                    className={fieldClass}
                  />
                </Field>

                <Field label="Message" hint={`${body.length}/2000`}>
                  <textarea
                    name="body"
                    required
                    maxLength={2000}
                    rows={5}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Share what's happening, what to do, and where to go for safety."
                    className="w-full resize-y rounded-lg border border-border bg-bg-elev px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none focus:ring-1 focus:ring-fg-muted/30"
                  />
                </Field>

                <Field label="Severity">
                  <div className="grid grid-cols-3 gap-2">
                    {severityOptions.map((opt) => {
                      const active = severity === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSeverity(opt.value)}
                          aria-pressed={active}
                          className="flex flex-col items-start rounded-lg border px-3 py-2 text-left transition-colors"
                          style={{
                            borderColor: active
                              ? opt.color
                              : "var(--color-border, rgba(255,255,255,0.08))",
                            background: active
                              ? `color-mix(in oklab, ${opt.color} 14%, transparent)`
                              : "transparent",
                          }}
                        >
                          <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: opt.color }}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: opt.color }} />
                            {opt.label}
                          </span>
                          <span className="mt-0.5 text-[11px] text-fg-muted">{opt.hint}</span>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="Audience">
                  <div className="space-y-1.5">
                    {audienceOptions.map((opt) => {
                      const active = audience === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setAudience(opt.value)}
                          aria-pressed={active}
                          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors ${
                            active
                              ? "border-fg/40 bg-bg-elev"
                              : "border-border hover:border-border-strong"
                          }`}
                        >
                          <span>
                            <span className="block text-sm font-medium text-fg">{opt.label}</span>
                            <span className="block text-[11px] text-fg-muted">{opt.hint}</span>
                          </span>
                          {active && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-fg" aria-hidden>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="Location">
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-fg-subtle">
                      <GlobeIcon />
                    </span>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className={`${fieldClass} cursor-pointer appearance-none pl-9 pr-9`}
                    >
                      <option value={WORLDWIDE}>🌍 Worldwide — all countries</option>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-fg-subtle">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-fg-muted">
                    {country === WORLDWIDE
                      ? "Reaches the selected audience everywhere."
                      : `Only reaches people in ${countryLabel(country)}.`}
                  </p>
                </Field>

                <Field label="Duration">
                  <div className="flex flex-wrap gap-2">
                    {durationOptions.map((opt) => {
                      const active = durationHours === opt.value;
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => setDurationHours(opt.value)}
                          aria-pressed={active}
                          className={`inline-flex h-9 items-center rounded-lg border px-3 text-xs font-medium transition-colors ${
                            active
                              ? "border-fg/40 bg-bg-elev text-fg"
                              : "border-border text-fg-muted hover:border-border-strong hover:text-fg"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-1.5 text-[11px] text-fg-muted">
                    {durationHours === null
                      ? "Stays in the feed until you remove it."
                      : "Automatically stops showing in the app after this time."}
                  </p>
                </Field>
              </div>

              {error && (
                <p role="alert" className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2.5 text-xs font-medium text-danger">
                  {error}
                </p>
              )}
              {success && (
                <p role="status" className="mt-4 rounded-lg border border-ok/40 bg-ok/10 px-3 py-2.5 text-xs font-medium text-ok">
                  {success}
                </p>
              )}

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex h-10 items-center rounded-lg border border-border bg-bg-card px-4 text-sm font-medium hover:border-border-strong transition-colors"
                >
                  {success ? "Done" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title.trim() || !body.trim()}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-fg px-4 text-sm font-semibold text-bg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? "Sending…" : "Send broadcast"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-xs font-medium text-fg-muted">
        <span>{label}</span>
        {hint && <span className="font-mono text-[10px] text-fg-subtle">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
