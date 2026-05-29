"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createIncident } from "./actions";
import { LocationAutocomplete } from "./LocationAutocomplete";

const typeOptions = [
  { value: "fire", label: "Fire" },
  { value: "armed", label: "Armed Incident" },
  { value: "crash", label: "Car Crash" },
  { value: "medical", label: "Medical" },
  { value: "flood", label: "Flooding" },
  { value: "traffic", label: "Traffic" },
  { value: "other", label: "Other" },
];

const severityOptions = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "info", label: "Info" },
  { value: "resolved", label: "Resolved" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "investigating", label: "Under Investigation" },
  { value: "resolved", label: "Resolved" },
  { value: "false_alarm", label: "False Alarm" },
];

const fieldClass =
  "h-10 w-full rounded-lg border border-border bg-bg-elev px-3 text-sm text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none focus:ring-1 focus:ring-fg-muted/30";

export function NewIncidentModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
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
    const res = await createIncident({
      title: String(fd.get("title") ?? ""),
      type: String(fd.get("type") ?? ""),
      severity: String(fd.get("severity") ?? ""),
      status: String(fd.get("status") ?? ""),
      description: String(fd.get("description") ?? ""),
      location: String(fd.get("location") ?? ""),
      address: String(fd.get("address") ?? ""),
      reporterName: anonymous ? "Anonymous" : String(fd.get("reporterName") ?? ""),
      lat: parseFloat(String(fd.get("lat") ?? "")),
      lng: parseFloat(String(fd.get("lng") ?? "")),
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
        <PlusIcon />
        New incident
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-border bg-bg-card shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">New incident</h2>
                <p className="text-xs text-fg-muted">Log a new incident report.</p>
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
                <Field label="Title">
                  <input name="title" required placeholder="Warehouse fire at Apapa Port" className={fieldClass} />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Type">
                    <select name="type" defaultValue="fire" className={fieldClass}>
                      {typeOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Severity">
                    <select name="severity" defaultValue="medium" className={fieldClass}>
                      {severityOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Status">
                    <select name="status" defaultValue="active" className={fieldClass}>
                      {statusOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Description">
                  <textarea
                    name="description"
                    required
                    rows={3}
                    placeholder="What's happening?"
                    className={`${fieldClass} h-auto resize-none py-2.5`}
                  />
                </Field>

                <LocationAutocomplete />

                <label className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-elev px-3.5 py-2.5">
                  <span className="text-sm text-fg">
                    Report anonymously
                    <span className="block text-[11px] text-fg-muted">Hide the reporter&apos;s name.</span>
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={anonymous}
                    onClick={() => setAnonymous((v) => !v)}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                      anonymous ? "bg-fg" : "border border-border-strong bg-bg-card"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 rounded-full transition-transform ${
                        anonymous ? "translate-x-[18px] bg-bg" : "translate-x-[3px] bg-fg-muted"
                      }`}
                    />
                  </button>
                </label>

                {!anonymous && (
                  <Field label="Reporter name">
                    <input name="reporterName" required placeholder="Adebayo Ogundimu" className={fieldClass} />
                  </Field>
                )}
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
                  {submitting ? "Creating…" : "Create incident"}
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

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
