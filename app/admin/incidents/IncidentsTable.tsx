"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  type Incident,
  type IncidentStatus,
  type IncidentType,
  type Severity,
  severityMeta,
  statusMeta,
  typeColor,
} from "../_lib/incidents";
import { TypeIcon } from "../_lib/icons";
import { FilterDropdown } from "../_components/FilterDropdown";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import { NewIncidentModal } from "./NewIncidentModal";
import { IncidentRowActions } from "./IncidentRowActions";
import { deleteIncidents } from "./actions";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "investigating", label: "Under Investigation" },
  { value: "resolved", label: "Resolved" },
  { value: "false_alarm", label: "False Alarm" },
];

const typeOptions = [
  { value: "all", label: "All types" },
  { value: "fire", label: "Fire" },
  { value: "armed", label: "Armed" },
  { value: "crash", label: "Car Crash" },
  { value: "medical", label: "Medical" },
  { value: "flood", label: "Flooding" },
  { value: "traffic", label: "Traffic" },
  { value: "hoodlums", label: "Hoodlums" },
  { value: "protest", label: "Protest" },
  { value: "kidnapping", label: "Kidnapping" },
  { value: "armed_robbery", label: "Armed Robbery" },
  { value: "bandit", label: "Bandit" },
  { value: "cultist", label: "Cultist" },
  { value: "collapse", label: "Collapse" },
  { value: "boat_accident", label: "Boat Accident" },
  { value: "other", label: "Other" },
];

const severityOptions = [
  { value: "all", label: "All severities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "info", label: "Info" },
  { value: "resolved", label: "Resolved" },
];

const timeOptions = [
  { value: "1h", label: "Last hour" },
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

export function IncidentsTable({ incidents }: { incidents: Incident[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [time, setTime] = useState("24h");

  // ── Batch selection ───────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const headerCheckRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();

  // Auto-refresh the incident list every minute.
  useEffect(() => {
    const id = setInterval(() => {
      startTransition(() => router.refresh());
    }, 60_000);
    return () => clearInterval(id);
  }, [router]);

  // Clear selection whenever the underlying list changes (after a delete / refresh).
  useEffect(() => {
    setSelected(new Set());
  }, [incidents]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return incidents.filter((i) => {
      if (q) {
        const hay = `${i.id} ${i.title} ${i.typeLabel} ${i.location} ${i.reporter}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (status !== "all" && i.status !== (status as IncidentStatus)) return false;
      if (type !== "all" && i.type !== (type as IncidentType)) return false;
      if (severity !== "all" && i.severity !== (severity as Severity)) return false;
      return true;
    });
  }, [incidents, query, status, type, severity]);

  // Keep the header checkbox in the right indeterminate / checked state.
  const allFilteredSelected =
    filtered.length > 0 && filtered.every((i) => selected.has(i.id));
  const someSelected = filtered.some((i) => selected.has(i.id));
  useEffect(() => {
    if (headerCheckRef.current) {
      headerCheckRef.current.indeterminate = someSelected && !allFilteredSelected;
    }
  }, [someSelected, allFilteredSelected]);

  function toggleAll() {
    if (allFilteredSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((i) => next.delete(i.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((i) => next.add(i.id));
        return next;
      });
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function confirmBatchDelete() {
    setDeleting(true);
    const res = await deleteIncidents([...selected]);
    setDeleting(false);
    setConfirmOpen(false);
    if ("error" in res) {
      alert(res.error);
    } else {
      router.refresh();
    }
  }

  const selectedCount = selected.size;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border bg-bg px-6 pb-5 pt-6">
        <div>
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-fg-muted">
            <span>Admin</span>
            <span className="text-fg-subtle">›</span>
            <span className="text-fg">Incidents</span>
          </nav>
          <h1 className="text-3xl font-semibold tracking-tight">Incident Management</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Showing <span className="font-semibold text-fg">{filtered.length}</span> of {incidents.length} incidents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-bg-card px-4 text-sm font-medium hover:border-border-strong transition-colors">
            <DownloadIcon />
            Export CSV
          </button>
          <NewIncidentModal />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-bg px-6 py-4">
        <div className="relative w-full max-w-xs">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-fg-subtle">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID, type, location…"
            className="h-10 w-full rounded-lg border border-border bg-bg-card pl-9 pr-3 text-sm text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none focus:ring-1 focus:ring-fg-muted/30"
          />
        </div>
        <span className="hidden h-6 w-px bg-border md:block" aria-hidden />
        <FilterDropdown label="Status" value={status} options={statusOptions} onChange={setStatus} />
        <FilterDropdown label="Type" value={type} options={typeOptions} onChange={setType} />
        <FilterDropdown label="Severity" value={severity} options={severityOptions} onChange={setSeverity} />
        <FilterDropdown label="Time" value={time} options={timeOptions} onChange={setTime} />
        <div className="ml-auto inline-flex items-center gap-1.5 text-xs text-fg-muted">
          <span>Auto-refresh</span>
          <span className="relative inline-flex h-1.5 w-1.5">
            {isRefreshing && <span className="absolute inset-0 rounded-full bg-ok animate-ping-slow" />}
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ok" />
          </span>
          <span className="font-mono text-fg">{isRefreshing ? "syncing…" : "1m"}</span>
        </div>
      </div>

      {/* Batch action bar — slides in when something is selected */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 border-b border-danger/30 bg-danger/8 px-6 py-2.5">
          <span className="text-sm font-medium text-fg">
            <span className="tabular-nums text-danger">{selectedCount}</span>{" "}
            incident{selectedCount !== 1 ? "s" : ""} selected
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSelected(new Set())}
              className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium hover:border-border-strong transition-colors"
            >
              Deselect all
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-danger/40 bg-danger/10 px-3 text-xs font-medium text-danger hover:bg-danger/20 transition-colors"
            >
              <TrashIcon />
              Delete {selectedCount} incident{selectedCount !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-bg">
            <tr className="text-left text-[10px] uppercase tracking-wider text-fg-subtle">
              <th className="border-b border-border px-4 py-3">
                <input
                  ref={headerCheckRef}
                  type="checkbox"
                  aria-label="Select all visible incidents"
                  checked={allFilteredSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 cursor-pointer rounded border-border accent-fg"
                />
              </th>
              <th className="border-b border-border px-2 py-3 font-medium">ID</th>
              <th className="border-b border-border py-3 font-medium">Type · Title</th>
              <th className="border-b border-border py-3 font-medium">Severity</th>
              <th className="border-b border-border py-3 font-medium">Location</th>
              <th className="border-b border-border py-3 font-medium">Reporter</th>
              <th className="border-b border-border py-3 font-medium">Time</th>
              <th className="border-b border-border py-3 font-medium">Status</th>
              <th className="border-b border-border px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-16 text-center text-sm text-fg-muted">
                  No incidents match these filters.
                </td>
              </tr>
            ) : (
              filtered.map((inc) => (
                <IncidentRow
                  key={inc.id}
                  incident={inc}
                  isSelected={selected.has(inc.id)}
                  onToggle={toggleOne}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border bg-bg px-6 py-3 text-xs text-fg-muted">
        <span>{filtered.length} rows · 25 per page</span>
        <div className="flex items-center gap-3">
          <button aria-label="Previous page" className="inline-flex h-7 w-7 items-center justify-center rounded border border-border text-fg-muted hover:text-fg disabled:opacity-40" disabled>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <span className="font-mono">
            <span className="text-fg">1</span> <span className="text-fg-subtle">/</span> 1
          </span>
          <button aria-label="Next page" className="inline-flex h-7 w-7 items-center justify-center rounded border border-border text-fg-muted hover:text-fg disabled:opacity-40" disabled>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      </div>

      {/* Batch delete confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title={`Delete ${selectedCount} incident${selectedCount !== 1 ? "s" : ""}?`}
        message={`This will permanently delete ${selectedCount} incident${selectedCount !== 1 ? "s" : ""}. This can't be undone.`}
        confirmLabel="Delete all"
        destructive
        busy={deleting}
        onConfirm={confirmBatchDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

function IncidentRow({
  incident,
  isSelected,
  onToggle,
}: {
  incident: Incident;
  isSelected: boolean;
  onToggle: (id: string) => void;
}) {
  // Fall back to safe defaults if a row carries a value the meta tables don't
  // know about yet — keeps the table rendering instead of throwing.
  const color = typeColor[incident.type] ?? typeColor.other;
  const sev = severityMeta[incident.severity] ?? severityMeta.info;
  const status = statusMeta[incident.status] ?? statusMeta.active;
  const initials = incident.reporter
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <tr
      className={`border-b border-border transition-colors hover:bg-bg-elev/40 ${isSelected ? "bg-bg-elev/60" : ""}`}
    >
      <td className="px-4 py-4">
        <input
          type="checkbox"
          aria-label={`Select incident ${incident.id}`}
          checked={isSelected}
          onChange={() => onToggle(incident.id)}
          className="h-4 w-4 cursor-pointer rounded border-border accent-fg"
        />
      </td>
      <td className="whitespace-nowrap px-2 py-4 font-mono text-xs text-fg-muted">
        <Link href={`/admin/incidents/${incident.id}`} className="hover:text-fg">
          {incident.id}
        </Link>
      </td>
      <td className="py-4 pr-6">
        <Link href={`/admin/incidents/${incident.id}`} className="flex items-center gap-3 hover:[&_.title]:underline">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: `color-mix(in oklab, ${color} 14%, transparent)`, color }}
          >
            <TypeIcon type={incident.type} size={16} />
          </span>
          <div className="leading-tight">
            <div className="title font-medium text-fg">{incident.title}</div>
            <div className="text-[11px] text-fg-muted">{incident.typeLabel}</div>
          </div>
        </Link>
      </td>
      <td className="py-4 pr-6">
        <span
          className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium"
          style={{
            color: sev.color,
            borderColor: `color-mix(in oklab, ${sev.color} 28%, transparent)`,
            background: `color-mix(in oklab, ${sev.color} 10%, transparent)`,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: sev.color }} />
          {sev.label}
        </span>
      </td>
      <td className="py-4 pr-6">
        <div className="leading-tight">
          <div className="text-fg">{incident.location}</div>
          <div className="font-mono text-[11px] text-fg-muted">
            {incident.coords.lat.toFixed(4)}, {incident.coords.lng.toFixed(4)}
          </div>
        </div>
      </td>
      <td className="py-4 pr-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-info text-[10px] font-semibold text-white">
            {initials}
          </span>
          <span className="text-fg">{incident.reporter}</span>
        </div>
      </td>
      <td className="py-4 pr-6 leading-tight">
        <div className="text-fg">{incident.reportedDate}</div>
        <div className="text-[11px] text-fg-muted">{incident.reportedAt}</div>
      </td>
      <td className="py-4 pr-6">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors"
          style={{
            color: status.color,
            borderColor: `color-mix(in oklab, ${status.color} 28%, transparent)`,
            background: `color-mix(in oklab, ${status.color} 10%, transparent)`,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.color }} />
          {status.label}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </td>
      <td className="px-6 py-4 text-right">
        <IncidentRowActions id={incident.id} status={incident.status} />
      </td>
    </tr>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
