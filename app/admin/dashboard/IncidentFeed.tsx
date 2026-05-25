"use client";

import { useMemo, useState } from "react";
import { IncidentCard } from "./IncidentCard";
import type { Incident, Severity } from "../_lib/incidents";

type Filter = "all" | "critical" | "high" | "medium" | "resolved";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "resolved", label: "Resolved" },
];

const sevMatch: Record<Exclude<Filter, "all" | "resolved">, Severity> = {
  critical: "critical",
  high: "high",
  medium: "medium",
};

type Props = {
  incidents: Incident[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function IncidentFeed({ incidents, selectedId, onSelect }: Props) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return incidents.filter((i) => i.status !== "resolved" && i.status !== "false_alarm");
    if (filter === "resolved") return incidents.filter((i) => i.status === "resolved" || i.status === "false_alarm");
    return incidents.filter((i) => i.severity === sevMatch[filter]);
  }, [filter, incidents]);

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-border bg-bg-card">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-semibold tracking-tight">Active Incidents Feed</h2>
            <span className="rounded bg-bg-elev px-1.5 py-0.5 font-mono text-[10px] text-fg-muted">
              {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button aria-label="Filter" className="inline-flex h-7 w-7 items-center justify-center rounded text-fg-muted hover:bg-bg-elev hover:text-fg">
              <FilterIcon />
            </button>
            <button aria-label="More" className="inline-flex h-7 w-7 items-center justify-center rounded text-fg-muted hover:bg-bg-elev hover:text-fg">
              <DotsIcon />
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`inline-flex h-7 items-center rounded-md px-2.5 text-xs font-medium transition-colors ${
                filter === f.id
                  ? "bg-fg text-bg"
                  : "text-fg-muted hover:bg-bg-elev hover:text-fg"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-border bg-bg-elev/40 px-4 py-2 text-[11px]">
        <span className="inline-flex items-center gap-2 text-ok">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-ok animate-ping-slow" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ok" />
          </span>
          Live stream active
        </span>
        <span className="text-fg-muted">{incidents.length} reports today</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center px-4 text-center text-xs text-fg-muted">
            No incidents match this filter.
          </div>
        ) : (
          filtered.map((inc) => (
            <IncidentCard
              key={inc.id}
              incident={inc}
              selected={inc.id === selectedId}
              onSelect={() => onSelect(inc.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}
