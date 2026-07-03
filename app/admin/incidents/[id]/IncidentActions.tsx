"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "../../_components/toast";
import { useRouter } from "next/navigation";
import type { IncidentStatus, Severity } from "../../_lib/incidents";
import {
  updateIncidentStatus,
  updateIncidentSeverity,
  deleteIncident,
} from "../actions";
import { ConfirmDialog } from "../../_components/ConfirmDialog";

export function IncidentActions({
  id,
  status,
  severity,
}: {
  id: string;
  status: IncidentStatus;
  severity: Severity;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
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
    if ("error" in res) toast(res.error, "error");
    else router.refresh();
  }

  async function escalate() {
    setBusy(true);
    const res = await updateIncidentSeverity(id, "critical");
    setBusy(false);
    if ("error" in res) toast(res.error, "error");
    else router.refresh();
  }

  function remove() {
    setOpen(false);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    setBusy(true);
    const res = await deleteIncident(id);
    if ("error" in res) {
      setBusy(false);
      setConfirmOpen(false);
      toast(res.error, "error");
      return;
    }
    router.push("/admin/incidents");
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setStatus("resolved")}
        disabled={busy || status === "resolved"}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-ok/40 bg-ok/10 px-3 text-sm font-medium text-ok hover:bg-ok/15 transition-colors disabled:opacity-40"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Mark Resolved
      </button>
      <button
        onClick={escalate}
        disabled={busy || severity === "critical"}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-bg-card px-3 text-sm font-medium hover:border-border-strong transition-colors disabled:opacity-40"
      >
        Escalate
      </button>
      <button
        onClick={() => setStatus("false_alarm")}
        disabled={busy || status === "false_alarm"}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-bg-card px-3 text-sm font-medium text-fg-muted hover:text-fg hover:border-border-strong transition-colors disabled:opacity-40"
      >
        False Alarm
      </button>

      <div ref={menuRef} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          disabled={busy}
          aria-label="More actions"
          aria-haspopup="menu"
          aria-expanded={open}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-fg-muted hover:text-fg hover:border-border-strong transition-colors disabled:opacity-40"
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
            <button
              role="menuitem"
              disabled={busy || status === "active"}
              onClick={() => setStatus("active")}
              className="block w-full px-3 py-2 text-left text-sm text-fg hover:bg-bg-elev transition-colors disabled:opacity-40"
            >
              Mark Active
            </button>
            <button
              role="menuitem"
              disabled={busy || status === "unverified"}
              onClick={() => setStatus("unverified")}
              className="block w-full px-3 py-2 text-left text-sm text-fg hover:bg-bg-elev transition-colors disabled:opacity-40"
            >
              Under Investigation
            </button>
            <div className="my-1 h-px bg-border" />
            <button
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
      </div>

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
