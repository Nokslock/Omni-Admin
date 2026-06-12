"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, WORLDWIDE, countryLabel } from "@/app/lib/countries";

/**
 * Searchable country picker used in the dashboard feed filters. Selecting a
 * country drives the map (fly + lock) and filters incidents to that area;
 * selecting "Worldwide" clears the lock.
 */
export function CountryFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    // Focus the search field when the popover opens.
    inputRef.current?.focus();
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q,
    );
  }, [query]);

  const isWorldwide = value === WORLDWIDE;

  function pick(code: string) {
    onChange(code);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={ref} className="relative">
      <div
        className={`flex h-8 w-full items-center rounded-md border bg-bg-elev/50 pr-1 text-xs transition-colors ${
          isWorldwide ? "border-border" : "border-info/40"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex h-full flex-1 items-center gap-1.5 truncate pl-2.5 text-left font-medium text-fg"
        >
          <GlobeIcon />
          <span className="truncate">
            {isWorldwide ? "Worldwide" : countryLabel(value)}
          </span>
        </button>
        {!isWorldwide && (
          <button
            type="button"
            aria-label="Clear country filter"
            onClick={() => pick(WORLDWIDE)}
            className="inline-flex h-6 w-6 items-center justify-center rounded text-fg-muted hover:bg-bg-elev hover:text-fg"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle country list"
          className="inline-flex h-6 w-6 items-center justify-center rounded text-fg-muted hover:text-fg"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-lg border border-border bg-bg-card shadow-xl shadow-black/40">
          <div className="border-b border-border p-2">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search countries…"
              className="h-8 w-full rounded-md border border-border bg-bg-elev px-2.5 text-xs text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {!query && (
              <Row
                label="🌍 Worldwide"
                active={isWorldwide}
                onClick={() => pick(WORLDWIDE)}
              />
            )}
            {results.length === 0 ? (
              <div className="px-3 py-3 text-center text-[11px] text-fg-muted">
                No countries match “{query}”.
              </div>
            ) : (
              results.map((c) => (
                <Row
                  key={c.code}
                  label={c.name}
                  trailing={c.code}
                  active={value === c.code}
                  onClick={() => pick(c.code)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  trailing,
  active,
  onClick,
}: {
  label: string;
  trailing?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-sm transition-colors hover:bg-bg-elev ${
        active ? "text-fg" : "text-fg-muted"
      }`}
    >
      <span className="truncate">{label}</span>
      {active ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-ok" aria-hidden>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : trailing ? (
        <span className="shrink-0 font-mono text-[10px] text-fg-subtle">{trailing}</span>
      ) : null}
    </button>
  );
}

function GlobeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
