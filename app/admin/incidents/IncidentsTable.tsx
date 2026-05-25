"use client";

import { useMemo, useState } from "react";
import {
  incidents as allIncidents,
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
  { value: "power", label: "Power Outage" },
  { value: "other", label: "Other" },
];

const severityOptions = [
  { value: "all", label: "All severities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
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

export function IncidentsTable() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [time, setTime] = useState("24h");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allIncidents.filter((i) => {
      if (q) {
        const hay = `${i.id} ${i.title} ${i.typeLabel} ${i.location} ${i.reporter}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (status !== "all" && i.status !== (status as IncidentStatus)) return false;
      if (type !== "all" && i.type !== (type as IncidentType)) return false;
      if (severity !== "all" && i.severity !== (severity as Severity)) return false;
      return true;
    });
  }, [query, status, type, severity]);

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
            Showing <span className="font-semibold text-fg">{filtered.length}</span> of {allIncidents.length} incidents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-bg-card px-4 text-sm font-medium hover:border-border-strong transition-colors">
            <DownloadIcon />
            Export CSV
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-fg px-4 text-sm font-medium text-bg hover:opacity-90 transition-opacity">
            <PlusIcon />
            New incident
          </button>
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
            <span className="absolute inset-0 rounded-full bg-ok animate-ping-slow" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ok" />
          </span>
          <span className="font-mono text-fg">5s</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-bg">
            <tr className="text-left text-[10px] uppercase tracking-wider text-fg-subtle">
              <th className="border-b border-border px-6 py-3 font-medium">ID</th>
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
                <td colSpan={8} className="px-6 py-16 text-center text-sm text-fg-muted">
                  No incidents match these filters.
                </td>
              </tr>
            ) : (
              filtered.map((inc) => <IncidentRow key={inc.id} incident={inc} />)
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
    </div>
  );
}

function IncidentRow({ incident }: { incident: Incident }) {
  const color = typeColor[incident.type];
  const sev = severityMeta[incident.severity];
  const status = statusMeta[incident.status];
  const initials = incident.reporter
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <tr className="border-b border-border transition-colors hover:bg-bg-elev/40">
      <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-fg-muted">{incident.id}</td>
      <td className="py-4 pr-6">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: `color-mix(in oklab, ${color} 14%, transparent)`, color }}
          >
            <TypeIcon type={incident.type} size={16} />
          </span>
          <div className="leading-tight">
            <div className="font-medium text-fg">{incident.title}</div>
            <div className="text-[11px] text-fg-muted">{incident.typeLabel}</div>
          </div>
        </div>
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
        <button aria-label="More actions" className="inline-flex h-7 w-7 items-center justify-center rounded text-fg-muted hover:bg-bg-elev hover:text-fg">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        </button>
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
function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
