"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { severityMeta, typeLabels } from "../_lib/incidents";
import { getRecentIncidents, type NotificationItem } from "../notifications";

const SEEN_KEY = "omni:notifications:lastSeen";
const POLL_MS = 30_000;

function relTime(iso: string): string {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function NotificationsBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const data = await getRecentIncidents();
    setItems(data);
  }, []);

  useEffect(() => {
    const init = async () => {
      const stored = Number(localStorage.getItem(SEEN_KEY) ?? 0);
      setLastSeen(Number.isFinite(stored) ? stored : 0);
      await refresh();
    };
    void init();
    const t = setInterval(() => void refresh(), POLL_MS);
    return () => clearInterval(t);
  }, [refresh]);

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

  const unread = items.filter((i) => new Date(i.reportedAt).getTime() > lastSeen).length;

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      const now = Date.now();
      setLastSeen(now);
      localStorage.setItem(SEEN_KEY, String(now));
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-fg-muted hover:text-fg hover:border-border-strong transition-colors"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-bg-card shadow-xl shadow-black/40"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold">Notifications</span>
            <span className="text-[11px] text-fg-muted">{items.length} recent</span>
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-fg-muted">No incidents yet.</p>
          ) : (
            <ul className="max-h-96 overflow-auto">
              {items.map((i) => (
                <li key={i.id}>
                  <Link
                    href={`/admin/incidents/${i.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-bg-elev"
                  >
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                      style={{ background: severityMeta[i.severity].color }}
                    />
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="truncate text-sm font-medium text-fg">{i.title}</div>
                      <div className="text-[11px] text-fg-muted">
                        {typeLabels[i.type]} · {relTime(i.reportedAt)}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/admin/incidents"
            onClick={() => setOpen(false)}
            className="block border-t border-border px-4 py-2.5 text-center text-xs font-medium text-fg-muted hover:bg-bg-elev hover:text-fg transition-colors"
          >
            View all incidents
          </Link>
        </div>
      )}
    </div>
  );
}
