"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "../_lib/users";
import { typeLabels, severityMeta, statusMeta } from "../_lib/incidents";
import { getIncidentsByReporter, type ReporterIncident } from "../incidents/actions";

function relTime(iso: string): string {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function UserActivityPanel({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  const [items, setItems] = useState<ReporterIncident[] | null>(null);

  useEffect(() => {
    let active = true;
    getIncidentsByReporter(user.id).then((d) => {
      if (active) setItems(d);
    });
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      active = false;
      document.removeEventListener("keydown", onKey);
    };
  }, [user.id, onClose]);

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-bg-card shadow-2xl shadow-black/40">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-bg-card px-5 py-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ background: user.avatarColor }}
            >
              {initials || "?"}
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold">{user.name}</div>
              <div className="text-[11px] text-fg-muted">{user.email}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-muted hover:bg-bg-elev hover:text-fg transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="text-[10px] uppercase tracking-wider text-fg-subtle">
            Reported incidents{items ? ` · ${items.length}` : ""}
          </div>

          {items === null ? (
            <p className="mt-4 text-sm text-fg-muted">Loading…</p>
          ) : items.length === 0 ? (
            <p className="mt-4 text-sm text-fg-muted">
              No incidents reported by this user.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {items.map((i) => {
                const st = statusMeta[i.status];
                return (
                  <li key={i.id}>
                    <Link
                      href={`/admin/incidents/${i.id}`}
                      onClick={onClose}
                      className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-bg-elev"
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
                        <div className="mt-1.5 flex items-center gap-2">
                          <span
                            className="inline-flex items-center gap-1 rounded border border-ok/30 bg-ok/10 px-1.5 py-0.5 text-[10px] font-medium text-ok"
                            title={`${i.confirms} confirmation${i.confirms === 1 ? "" : "s"}`}
                          >
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {i.confirms}
                          </span>
                          <span
                            className="inline-flex items-center gap-1 rounded border border-warn/30 bg-warn/10 px-1.5 py-0.5 text-[10px] font-medium text-warn"
                            title={`${i.flags} flag${i.flags === 1 ? "" : "s"} as false`}
                          >
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                              <line x1="4" y1="22" x2="4" y2="15" />
                            </svg>
                            {i.flags}
                          </span>
                        </div>
                      </div>
                      <span
                        className="shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-medium"
                        style={{
                          color: st.color,
                          borderColor: `color-mix(in oklab, ${st.color} 28%, transparent)`,
                          background: `color-mix(in oklab, ${st.color} 10%, transparent)`,
                        }}
                      >
                        {st.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
