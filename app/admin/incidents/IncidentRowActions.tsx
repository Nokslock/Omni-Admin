"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { IncidentStatus } from "../_lib/incidents";
import { updateIncidentStatus, deleteIncident } from "./actions";
import { ConfirmDialog } from "../_components/ConfirmDialog";

const statusActions: { value: IncidentStatus; label: string }[] = [
  { value: "active", label: "Mark Active" },
  { value: "investigating", label: "Under Investigation" },
  { value: "resolved", label: "Mark Resolved" },
  { value: "false_alarm", label: "Mark False Alarm" },
];

export function IncidentRowActions({
  id,
  status,
}: {
  id: string;
  status: IncidentStatus;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function setStatus(next: IncidentStatus) {
    setBusy(true);
    const res = await updateIncidentStatus(id, next);
    setBusy(false);
    setOpen(false);
    if ("error" in res) alert(res.error);
    else router.refresh();
  }

  function remove() {
    setOpen(false);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    setBusy(true);
    const res = await deleteIncident(id);
    setBusy(false);
    setConfirmOpen(false);
    if ("error" in res) alert(res.error);
    else router.refresh();
  }

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={busy}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-7 w-7 items-center justify-center rounded text-fg-muted hover:bg-bg-elev hover:text-fg disabled:opacity-50"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <circle cx="5" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="19" cy="12" r="1.5" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1 w-52 overflow-hidden rounded-lg border border-border bg-bg-card py-1 text-left shadow-xl shadow-black/40"
        >
          <Link
            href={`/admin/incidents/${id}`}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-fg hover:bg-bg-elev transition-colors"
          >
            View details
          </Link>

          <div className="my-1 h-px bg-border" />
          <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-fg-subtle">
            Set status
          </div>
          {statusActions.map((s) => (
            <button
              key={s.value}
              type="button"
              role="menuitem"
              disabled={busy || s.value === status}
              onClick={() => setStatus(s.value)}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-fg hover:bg-bg-elev transition-colors disabled:opacity-40"
            >
              {s.label}
              {s.value === status && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-ok" aria-hidden>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}

          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            role="menuitem"
            disabled={busy}
            onClick={remove}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-danger/10 transition-colors disabled:opacity-40"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete incident
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete incident"
        message={`Delete incident ${id}? This can't be undone.`}
        confirmLabel="Delete"
        destructive
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
