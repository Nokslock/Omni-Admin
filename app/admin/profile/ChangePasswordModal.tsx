"use client";

import { useEffect, useState } from "react";
import { changePassword } from "./actions";

const fieldClass =
  "h-10 w-full rounded-lg border border-border bg-bg-elev px-3 text-sm text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none focus:ring-1 focus:ring-fg-muted/30";

export function ChangePasswordModal() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(false);
    setCurrent("");
    setNext("");
    setConfirm("");
    setError(null);
    setDone(false);
    setSubmitting(false);
  }

  // Live validation.
  const lenOk = next.length >= 6;
  const diffOk = next.length > 0 && next !== current;
  const matchOk = confirm.length > 0 && confirm === next;
  const canSubmit = current.length > 0 && lenOk && diffOk && matchOk && !submitting;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const res = await changePassword(current, next);
    setSubmitting(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    setDone(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-bg-card px-4 text-sm font-medium hover:border-border-strong transition-colors"
      >
        <LockIcon />
        Change password
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-bg-card shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold tracking-tight">Change password</h2>
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

            {done ? (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-fg">Your password has been updated.</p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-5 inline-flex h-10 items-center rounded-lg bg-fg px-4 text-sm font-semibold text-bg hover:opacity-90 transition-opacity"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="px-6 py-5">
                <div className="space-y-4">
                  <Field label="Current password">
                    <input
                      type="password"
                      value={current}
                      onChange={(e) => setCurrent(e.target.value)}
                      required
                      autoComplete="current-password"
                      className={fieldClass}
                    />
                  </Field>

                  <Field label="New password">
                    <input
                      type="password"
                      value={next}
                      onChange={(e) => setNext(e.target.value)}
                      required
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      className={fieldClass}
                    />
                    {next.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        <Req ok={lenOk} label="At least 6 characters" />
                        <Req ok={diffOk} label="Different from current password" />
                      </ul>
                    )}
                  </Field>

                  <Field label="Confirm new password">
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                      className={fieldClass}
                    />
                    {confirm.length > 0 && (
                      <p className={`mt-1.5 flex items-center gap-1.5 text-[11px] ${matchOk ? "text-ok" : "text-danger"}`}>
                        {matchOk ? <CheckMini /> : <CrossMini />}
                        {matchOk ? "Passwords match" : "Passwords don't match"}
                      </p>
                    )}
                  </Field>
                </div>

                {error && (
                  <p role="alert" className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2.5 text-xs font-medium text-danger">
                    {error}
                  </p>
                )}

                <div className="mt-6 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="inline-flex h-10 items-center rounded-lg border border-border bg-bg-card px-4 text-sm font-medium hover:border-border-strong transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="inline-flex h-10 items-center rounded-lg bg-fg px-4 text-sm font-semibold text-bg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {submitting ? "Updating…" : "Update password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-fg-muted">{label}</span>
      {children}
    </label>
  );
}

function Req({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-1.5 text-[11px] ${ok ? "text-ok" : "text-fg-subtle"}`}>
      {ok ? <CheckMini /> : <DotMini />}
      {label}
    </li>
  );
}

function CheckMini() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function CrossMini() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function DotMini() {
  return <span className="inline-block h-1.5 w-1.5 rounded-full bg-fg-subtle" aria-hidden />;
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
