"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { statusMeta } from "../_lib/incidents";
import { TypeIcon } from "../_lib/icons";
import { globalSearch } from "./search.actions";
import type { IncidentHit, UserHit } from "../_lib/search.data";

// A flat, navigable list of everything currently shown in the dropdown. The
// command palette doesn't care whether an item is an incident, a user, or the
// "search all" action — it just needs a stable index and a destination href.
type Item =
  | { kind: "incident"; href: string; data: IncidentHit }
  | { kind: "user"; href: string; data: UserHit }
  | { kind: "action"; href: string; label: string };

const DEBOUNCE_MS = 180;

export function GlobalSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ incidents: IncidentHit[]; users: UserHit[] }>({
    incidents: [],
    users: [],
  });
  const [active, setActive] = useState(0);

  // ⌘K / Ctrl-K focuses the search from anywhere in the admin.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Debounced query → server action. `loading` is flipped on in the change
  // handler (an event handler, where synchronous setState is fine) so the
  // dropdown shows "Searching…" instantly; the effect only turns it back off
  // once the request resolves.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await globalSearch(q);
        if (!cancelled) {
          setResults(res);
          setActive(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  const items = useMemo<Item[]>(() => {
    const out: Item[] = [];
    for (const inc of results.incidents) {
      out.push({ kind: "incident", href: `/admin/incidents/${inc.id}`, data: inc });
    }
    for (const u of results.users) {
      out.push({
        kind: "user",
        href: `/admin/users?q=${encodeURIComponent(u.email)}`,
        data: u,
      });
    }
    const q = query.trim();
    if (q.length >= 2) {
      out.push({
        kind: "action",
        href: `/admin/incidents?q=${encodeURIComponent(q)}`,
        label: `Search all incidents for “${q}”`,
      });
    }
    return out;
  }, [results, query]);

  const go = useCallback(
    (item: Item) => {
      setOpen(false);
      inputRef.current?.blur();
      router.push(item.href);
    },
    [router],
  );

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!open || items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[active];
      if (item) go(item);
    }
  }

  const showDropdown = open && query.trim().length >= 2;
  const hasResults = items.length > 0;

  return (
    <div className="relative w-full max-w-xl">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-fg-subtle">
        <SearchIcon />
      </span>
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder="Search incidents, users, locations…"
        value={query}
        onChange={(e) => {
          const next = e.target.value;
          setQuery(next);
          setOpen(true);
          const hasQuery = next.trim().length >= 2;
          setLoading(hasQuery);
          if (!hasQuery) setResults({ incidents: [], users: [] });
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Delay so an onMouseDown on a result still registers before close.
          window.setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={onInputKeyDown}
        className="h-10 w-full rounded-lg border border-border bg-bg-elev pl-9 pr-14 text-sm text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none focus:ring-1 focus:ring-fg-muted/30"
      />
      <kbd className="pointer-events-none absolute inset-y-0 right-2 my-auto flex h-5 items-center rounded border border-border bg-bg-card px-1.5 font-mono text-[10px] text-fg-muted">
        ⌘K
      </kbd>

      {showDropdown && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-lg border border-border bg-bg-card shadow-xl"
        >
          {loading && !hasResults ? (
            <div className="px-3 py-6 text-center text-sm text-fg-muted">Searching…</div>
          ) : !hasResults ? (
            <div className="px-3 py-6 text-center text-sm text-fg-muted">
              No matches for “{query.trim()}”
            </div>
          ) : (
            <ul className="max-h-[22rem] overflow-y-auto py-1">
              {results.incidents.length > 0 && <GroupLabel>Incidents</GroupLabel>}
              {items.map((item, i) =>
                item.kind === "incident" ? (
                  <Row
                    key={`inc-${item.data.id}`}
                    index={i}
                    active={active === i}
                    onActivate={setActive}
                    onSelect={() => go(item)}
                  >
                    <span className="text-fg-muted">
                      <TypeIcon type={item.data.type} size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-fg">{item.data.title}</span>
                      <span className="block truncate text-xs text-fg-muted">
                        {item.data.typeLabel} · {item.data.location}
                      </span>
                    </span>
                    <StatusDot status={item.data.status} />
                  </Row>
                ) : item.kind === "user" ? (
                  <UserRowGroup key={`grp-${item.data.id}`} index={i} results={results} />
                ) : (
                  <Row
                    key="action"
                    index={i}
                    active={active === i}
                    onActivate={setActive}
                    onSelect={() => go(item)}
                  >
                    <span className="text-fg-muted">
                      <SearchIcon />
                    </span>
                    <span className="flex-1 truncate text-fg-muted">{item.label}</span>
                  </Row>
                ),
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );

  // Renders the "Users" group label exactly once, just before the first user
  // row, then the user row itself. Keeps the flat `items` index intact for
  // keyboard nav while still grouping visually.
  function UserRowGroup({
    index,
    results,
  }: {
    index: number;
    results: { incidents: IncidentHit[]; users: UserHit[] };
  }) {
    const item = items[index];
    if (item?.kind !== "user") return null;
    const isFirstUser = index === results.incidents.length;
    return (
      <>
        {isFirstUser && <GroupLabel>Users</GroupLabel>}
        <Row
          index={index}
          active={active === index}
          onActivate={setActive}
          onSelect={() => go(item)}
        >
          <Avatar name={item.data.name} color={item.data.avatarColor} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-fg">{item.data.name}</span>
            <span className="block truncate text-xs text-fg-muted">{item.data.email}</span>
          </span>
        </Row>
      </>
    );
  }
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <li className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-fg-subtle">
      {children}
    </li>
  );
}

function Row({
  index,
  active,
  onActivate,
  onSelect,
  children,
}: {
  index: number;
  active: boolean;
  onActivate: (i: number) => void;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <li role="option" aria-selected={active}>
      <button
        type="button"
        // Use onMouseDown so selection fires before the input's onBlur closes us.
        onMouseDown={(e) => {
          e.preventDefault();
          onSelect();
        }}
        onMouseEnter={() => onActivate(index)}
        className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
          active ? "bg-bg-elev" : "hover:bg-bg-elev/50"
        }`}
      >
        {children}
      </button>
    </li>
  );
}

function StatusDot({ status }: { status: keyof typeof statusMeta }) {
  const meta = statusMeta[status];
  return (
    <span className="flex shrink-0 items-center gap-1.5 text-xs text-fg-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
      {meta.label}
    </span>
  );
}

function Avatar({ name, color }: { name: string; color: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {initials}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
