"use client";

import { ProBadge } from "../_components/ProBadge";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { toast } from "../_components/toast";
import { EmptyState, GUTTER, PageHeader, Panel, SearchField, StatGrid, StatTile, StatusPill, TD, TH, TR } from "../_components/ui";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "unverified", label: "Unverified" },
  { value: "active", label: "Investigating" },
  { value: "resolved", label: "Resolved" },
  { value: "false_alarm", label: "False alarm" },
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

export function IncidentsTable({
  incidents,
  initialStatus,
}: {
  incidents: Incident[];
  initialStatus?: string;
}) {
  // When arriving from global search (?q=…) pre-fill the box, and widen the time
  // window to "all" so an older matching incident isn't hidden by the 24h default.
  const initialQuery = useSearchParams().get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(
    statusOptions.some((o) => o.value === initialStatus) ? initialStatus! : "all",
  );
  const [type, setType] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [time, setTime] = useState(initialQuery || initialStatus ? "all" : "24h");

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

  // Derive the still-valid selection: drop any ids that no longer exist in the
  // list (e.g. after a delete / auto-refresh). This replaces clearing selection
  // in an effect, which would trigger an extra render pass.
  const validSelected = useMemo(() => {
    const liveIds = new Set(incidents.map((i) => i.id));
    const next = new Set<string>();
    selected.forEach((id) => {
      if (liveIds.has(id)) next.add(id);
    });
    return next;
  }, [incidents, selected]);

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
    filtered.length > 0 && filtered.every((i) => validSelected.has(i.id));
  const someSelected = filtered.some((i) => validSelected.has(i.id));
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
    const res = await deleteIncidents([...validSelected]);
    setDeleting(false);
    setConfirmOpen(false);
    if ("error" in res) {
      toast(res.error, "error");
    } else {
      router.refresh();
    }
  }

  const selectedCount = validSelected.size;

  const statusCounts = useMemo(() => {
    const c: Record<IncidentStatus, number> = { unverified: 0, active: 0, resolved: 0, false_alarm: 0 };
    for (const i of incidents) if (i.status in c) c[i.status]++;
    return c;
  }, [incidents]);
  const tiles: IncidentStatus[] = ["unverified", "active", "resolved", "false_alarm"];
  const filtersOn = !!query.trim() || status !== "all" || type !== "all" || severity !== "all";
  function clearFilters() {
    setQuery("");
    setStatus("all");
    setType("all");
    setSeverity("all");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Incidents"
        description={
          <>
            Every report sent in from the app. Showing{" "}
            <span className="font-semibold text-fg">{filtered.length}</span> of {incidents.length}.
          </>
        }
        actions={<NewIncidentModal />}
      >
        <StatGrid>
          {tiles.map((t) => (
            <StatTile
              key={t}
              label={statusMeta[t].label}
              value={statusCounts[t].toLocaleString()}
              color={statusMeta[t].color}
              active={status === t}
              onClick={() => setStatus(status === t ? "all" : t)}
            />
          ))}
        </StatGrid>
      </PageHeader>

      <div className={`flex min-h-0 flex-1 flex-col pb-6 ${GUTTER}`}>
      <Panel className="flex min-h-[440px] flex-1 flex-col overflow-hidden">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-border px-4 py-3">
        <SearchField value={query} onChange={setQuery} placeholder="Search by ID, type, location…" />
        <FilterDropdown label="Status" value={status} options={statusOptions} onChange={setStatus} />
        <FilterDropdown label="Type" value={type} options={typeOptions} onChange={setType} />
        <FilterDropdown label="Severity" value={severity} options={severityOptions} onChange={setSeverity} />
        <FilterDropdown label="Time" value={time} options={timeOptions} onChange={setTime} />
        {filtersOn && (
          <button
            type="button"
            onClick={clearFilters}
            className="h-10 rounded-xl px-2.5 text-sm font-medium text-fg-muted transition-colors hover:text-fg"
          >
            Clear
          </button>
        )}
      </div>

      {/* Batch action bar — slides in when something is selected */}
      {selectedCount > 0 && (
        <div className="flex animate-swap-in items-center gap-3 border-b border-danger/25 bg-danger/10 px-5 py-2.5">
          <span className="text-sm font-medium text-fg">
            <span className="tabular-nums text-danger">{selectedCount}</span>{" "}
            incident{selectedCount !== 1 ? "s" : ""} selected
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSelected(new Set())}
              className="inline-flex h-8 items-center rounded-lg border border-border bg-bg-card px-3 text-xs font-medium transition-colors hover:border-border-strong"
            >
              Deselect all
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-danger px-3 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              <TrashIcon />
              Delete {selectedCount} incident{selectedCount !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className={TH}>
                <input
                  ref={headerCheckRef}
                  type="checkbox"
                  aria-label="Select all visible incidents"
                  checked={allFilteredSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 cursor-pointer rounded border-border accent-fg"
                />
              </th>
              <th className={TH}>ID</th>
              <th className={TH}>Type · Title</th>
              <th className={TH}>Severity</th>
              <th className={TH}>Location</th>
              <th className={TH}>Reporter</th>
              <th className={TH}>Time</th>
              <th className={TH}>Status</th>
              <th className={TH}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <EmptyState
                    title="No incidents match"
                    hint={filtersOn ? "Try a different search or clear the filters." : "Reports from the app will show up here."}
                  />
                </td>
              </tr>
            ) : (
              filtered.map((inc) => (
                <IncidentRow
                  key={inc.id}
                  incident={inc}
                  isSelected={validSelected.has(inc.id)}
                  onToggle={toggleOne}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-3 text-xs text-fg-muted">
        <span>
          <span className="font-semibold text-fg">{filtered.length}</span> incident{filtered.length === 1 ? "" : "s"}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="relative inline-flex h-1.5 w-1.5">
            {isRefreshing && <span className="absolute inset-0 animate-ping-slow rounded-full bg-ok" />}
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ok" />
          </span>
          {isRefreshing ? "Syncing…" : "Refreshes every minute"}
        </span>
      </div>
      </Panel>
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
      className={`${TR} ${isSelected ? "bg-bg-elev/70" : ""}`}
    >
      <td className={`${TD} w-10`}>
        <input
          type="checkbox"
          aria-label={`Select incident ${incident.id}`}
          checked={isSelected}
          onChange={() => onToggle(incident.id)}
          className="h-4 w-4 cursor-pointer rounded border-border accent-fg"
        />
      </td>
      <td className={`${TD} whitespace-nowrap font-mono text-xs text-fg-muted`}>
        <Link href={`/admin/incidents/${incident.id}`} className="hover:text-fg">
          {incident.id}
        </Link>
      </td>
      <td className={TD}>
        <Link href={`/admin/incidents/${incident.id}`} className="flex items-center gap-3 hover:[&_.title]:underline">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: `color-mix(in oklab, ${color} 14%, transparent)`, color }}
          >
            <TypeIcon type={incident.type} size={16} />
          </span>
          <div className="leading-tight">
            <div className="title font-medium text-fg">{incident.title}</div>
            <div className="mt-0.5 text-xs text-fg-muted">{incident.typeLabel}</div>
          </div>
        </Link>
      </td>
      <td className={TD}>
        <StatusPill color={sev.color} label={sev.label} />
      </td>
      <td className={TD}>
        <div className="leading-tight">
          <div className="text-fg">{incident.location}</div>
          <div className="mt-0.5 font-mono text-[11px] text-fg-subtle">
            {incident.coords.lat.toFixed(4)}, {incident.coords.lng.toFixed(4)}
          </div>
        </div>
      </td>
      <td className={TD}>
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-info text-[10px] font-semibold text-white">
            {initials}
          </span>
          <span className="whitespace-nowrap text-fg">{incident.reporter}</span>
          {incident.reporterPro && <ProBadge />}
        </div>
      </td>
      <td className={`${TD} whitespace-nowrap leading-tight`}>
        <div className="text-fg">{incident.reportedDate}</div>
        <div className="mt-0.5 text-xs text-fg-muted">{incident.reportedAt}</div>
      </td>
      <td className={TD}>
        <StatusPill color={status.color} label={status.label} />
      </td>
      <td className={`${TD} text-right`}>
        <IncidentRowActions id={incident.id} status={incident.status} />
      </td>
    </tr>
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
