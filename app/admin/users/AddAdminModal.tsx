"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createAdmin } from "./actions";

const fieldClass =
  "h-10 w-full rounded-lg border border-border bg-bg-elev px-3 text-sm text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none focus:ring-1 focus:ring-fg-muted/30";

export function AddAdminModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await createAdmin({
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
    });

    if ("error" in res) {
      setError(res.error);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-fg px-4 text-sm font-medium text-bg hover:opacity-90 transition-opacity"
      >
        <ShieldPlusIcon />
        Add admin
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="my-8 w-full max-w-md rounded-2xl border border-border bg-bg-card shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Add admin</h2>
                <p className="text-xs text-fg-muted">Creates a login account with admin access.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
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
                <Field label="Full name">
                  <input name="name" required placeholder="Ada Bello" className={fieldClass} />
                </Field>
                <Field label="Email">
                  <input name="email" type="email" required placeholder="a.bello@omni.ng" className={fieldClass} />
                </Field>
                <Field label="Password">
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    className={fieldClass}
                  />
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
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 items-center rounded-lg border border-border bg-bg-card px-4 text-sm font-medium hover:border-border-strong transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-fg px-4 text-sm font-semibold text-bg hover:opacity-90 transition-opacity disabled:opacity-70"
                >
                  {submitting ? "Creating…" : "Create admin"}
                </button>
              </div>
            </form>
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

function ShieldPlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="14" />
      <line x1="9" y1="11" x2="15" y2="11" />
    </svg>
  );
}
