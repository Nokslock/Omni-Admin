"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IncidentCard } from "./IncidentCard";
import { CountryFilter } from "./CountryFilter";
import type { Incident, IncidentType, Severity } from "../_lib/incidents";

type Filter = "all" | "critical" | "high" | "medium" | "resolved";
type SortKey = "newest" | "oldest" | "severity";

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

const typeFilters: { id: IncidentType | "all"; label: string }[] = [
  { id: "all", label: "All types" },
  { id: "fire", label: "Fire" },
  { id: "armed", label: "Armed Incident" },
  { id: "crash", label: "Car Crash" },
  { id: "medical", label: "Medical" },
  { id: "flood", label: "Flooding" },
  { id: "traffic", label: "Traffic" },
  { id: "other", label: "Other" },
];

const sortOptions: { id: SortKey; label: string }[] = [
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "severity", label: "Severity (high → low)" },
];

const severityRank: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
  resolved: 5,
};

type Props = {
  incidents: Incident[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  country: string;
  onCountryChange: (code: string) => void;
};

export function IncidentFeed({
  incidents,
  selectedId,
  onSelect,
  country,
  onCountryChange,
}: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [typeFilter, setTypeFilter] = useState<IncidentType | "all">("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen && !menuOpen) return;
    function onDown(e: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setFilterOpen(false);
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [filterOpen, menuOpen]);

  const filtered = useMemo(() => {
    let list: Incident[];
    if (filter === "resolved") {
      list = incidents.filter((i) => i.status === "resolved" || i.status === "false_alarm");
    } else {
      const active = incidents.filter((i) => i.status !== "resolved" && i.status !== "false_alarm");
      list = filter === "all" ? active : active.filter((i) => i.severity === sevMatch[filter]);
    }

    if (typeFilter !== "all") list = list.filter((i) => i.type === typeFilter);

    if (sort === "oldest") list = [...list].reverse();
    else if (sort === "severity")
      list = [...list].sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
    // "newest" keeps the incoming order (DB returns newest-first).

    return list;
  }, [filter, typeFilter, sort, incidents]);

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
          <div ref={actionsRef} className="flex items-center gap-1">
            {/* Filter by type */}
            <div className="relative">
              <button
                aria-label="Filter by type"
                aria-haspopup="menu"
                aria-expanded={filterOpen}
                onClick={() => {
                  setFilterOpen((v) => !v);
                  setMenuOpen(false);
                }}
                className={`relative inline-flex h-7 w-7 items-center justify-center rounded hover:bg-bg-elev hover:text-fg ${
                  typeFilter !== "all" ? "text-fg" : "text-fg-muted"
                }`}
              >
                <FilterIcon />
                {typeFilter !== "all" && (
                  <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-info" />
                )}
              </button>
              {filterOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-50 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-bg-card py-1 shadow-xl shadow-black/40"
                >
                  <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-fg-subtle">
                    Type
                  </div>
                  {typeFilters.map((t) => (
                    <button
                      key={t.id}
                      role="menuitemradio"
                      aria-checked={typeFilter === t.id}
                      onClick={() => {
                        setTypeFilter(t.id);
                        setFilterOpen(false);
                      }}
                      className="flex w-full items-center justify-between px-3 py-1.5 text-left text-sm text-fg hover:bg-bg-elev transition-colors"
                    >
                      {t.label}
                      {typeFilter === t.id && <CheckIcon />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort menu */}
            <div className="relative">
              <button
                aria-label="Sort"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => {
                  setMenuOpen((v) => !v);
                  setFilterOpen(false);
                }}
                className="inline-flex h-7 w-7 items-center justify-center rounded text-fg-muted hover:bg-bg-elev hover:text-fg"
              >
                <DotsIcon />
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-50 mt-1 w-52 overflow-hidden rounded-lg border border-border bg-bg-card py-1 shadow-xl shadow-black/40"
                >
                  <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-fg-subtle">
                    Sort by
                  </div>
                  {sortOptions.map((s) => (
                    <button
                      key={s.id}
                      role="menuitemradio"
                      aria-checked={sort === s.id}
                      onClick={() => {
                        setSort(s.id);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center justify-between px-3 py-1.5 text-left text-sm text-fg hover:bg-bg-elev transition-colors"
                    >
                      {s.label}
                      {sort === s.id && <CheckIcon />}
                    </button>
                  ))}
                </div>
              )}
            </div>
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

        {/* Country lock — flies the map to the chosen country and filters
            the feed to incidents within it. */}
        <div className="mt-3">
          <div className="mb-1 text-[10px] uppercase tracking-wider text-fg-subtle">
            Region
          </div>
          <CountryFilter value={country} onChange={onCountryChange} />
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
        <span className="text-fg-muted">
          {incidents.filter((i) => i.reportedDate === new Date().toISOString().slice(0, 10)).length} reports today
        </span>
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

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-ok" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
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
