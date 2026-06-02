"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  missingStatusMeta,
  type MissingRequest,
  type MissingStatus,
} from "../_lib/missing";
import { setMissingStatus } from "./actions";

type Tab = MissingStatus | "all";

const tabs: { id: Tab; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "resolved", label: "Resolved" },
  { id: "all", label: "All" },
];

function relTime(iso: string): string {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function MissingList({ requests }: { requests: MissingRequest[] }) {
  const [tab, setTab] = useState<Tab>("pending");

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0, resolved: 0 };
    for (const r of requests) c[r.status]++;
    return c;
  }, [requests]);

  const filtered = useMemo(
    () => (tab === "all" ? requests : requests.filter((r) => r.status === tab)),
    [tab, requests],
  );

  return (
    <div className="mx-auto w-full max-w-5xl">
      <nav className="mb-3 flex items-center gap-1.5 text-xs text-fg-muted">
        <span>Admin</span>
        <span className="text-fg-subtle">›</span>
        <span className="text-fg">Missing persons</span>
      </nav>
      <h1 className="text-3xl font-semibold tracking-tight">Missing-person requests</h1>
      <p className="mt-1 text-sm text-fg-muted">
        Review and approve requests submitted from the mobile app.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-1 border-b border-border">
        {tabs.map((t) => {
          const count =
            t.id === "all"
              ? requests.length
              : counts[t.id as MissingStatus] ?? 0;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex h-9 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors ${
                active
                  ? "border-fg text-fg"
                  : "border-transparent text-fg-muted hover:text-fg"
              }`}
            >
              {t.label}
              <span
                className={`rounded px-1.5 text-[10px] font-mono ${
                  active ? "bg-bg-elev text-fg" : "bg-bg-elev text-fg-muted"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-fg-muted">
          No {tab === "all" ? "" : tab} requests.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {filtered.map((r) => (
            <RequestCard key={r.id} request={r} />
          ))}
        </ul>
      )}
    </div>
  );
}

function RequestCard({ request: r }: { request: MissingRequest }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const meta = missingStatusMeta[r.status];

  async function change(next: MissingStatus) {
    setBusy(true);
    const res = await setMissingStatus(r.id, next);
    setBusy(false);
    if ("error" in res) alert(res.error);
    else router.refresh();
  }

  return (
    <li className="overflow-hidden rounded-xl border border-border bg-bg-card">
      <div className="flex flex-col gap-4 p-5 sm:flex-row">
        {r.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={r.imageUrl}
            alt={r.title}
            className="h-32 w-32 shrink-0 rounded-lg border border-border object-cover"
          />
        ) : (
          <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-lg border border-border bg-bg-elev text-[10px] uppercase tracking-wider text-fg-subtle">
            No photo
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-fg">{r.title}</h3>
              <p className="text-[11px] text-fg-muted">
                Submitted {relTime(r.createdAt)} ·{" "}
                {r.submitterName ?? "Unknown user"}
                {r.submitterEmail ? ` · ${r.submitterEmail}` : ""}
              </p>
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium"
              style={{
                color: meta.color,
                borderColor: `color-mix(in oklab, ${meta.color} 28%, transparent)`,
                background: `color-mix(in oklab, ${meta.color} 10%, transparent)`,
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
              {meta.label}
            </span>
          </div>

          <p className="mt-3 whitespace-pre-wrap text-sm text-fg">{r.message}</p>

          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-xs sm:grid-cols-2">
            <Pair label="Contact" value={r.contactInfo} mono />
            {r.lastSeenPlace && <Pair label="Last seen at" value={r.lastSeenPlace} />}
            {r.lastSeenAt && <Pair label="Last seen on" value={new Date(r.lastSeenAt).toLocaleString()} />}
            {r.lastSeenLat != null && r.lastSeenLng != null && (
              <Pair
                label="Coordinates"
                value={`${r.lastSeenLat.toFixed(4)}°N · ${r.lastSeenLng.toFixed(4)}°E`}
                mono
              />
            )}
            {r.reviewedAt && <Pair label="Reviewed" value={relTime(r.reviewedAt)} />}
            {r.broadcastAt && <Pair label="Broadcast" value={relTime(r.broadcastAt)} />}
            {r.adminNotes && <Pair label="Admin notes" value={r.adminNotes} />}
          </dl>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => change("approved")}
              disabled={busy || r.status === "approved"}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-ok/40 bg-ok/10 px-3 text-xs font-semibold text-ok hover:bg-ok/15 transition-colors disabled:opacity-40"
            >
              Approve
            </button>
            <button
              onClick={() => change("rejected")}
              disabled={busy || r.status === "rejected"}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-danger/40 bg-danger/10 px-3 text-xs font-semibold text-danger hover:bg-danger/15 transition-colors disabled:opacity-40"
            >
              Reject
            </button>
            <button
              onClick={() => change("resolved")}
              disabled={busy || r.status === "resolved"}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-info/40 bg-info/10 px-3 text-xs font-semibold text-info hover:bg-info/15 transition-colors disabled:opacity-40"
            >
              Mark Resolved
            </button>
            {r.imageUrl && (
              <a
                href={r.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-bg-card px-3 text-xs font-medium text-fg-muted hover:text-fg hover:border-border-strong transition-colors"
              >
                Open photo
              </a>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function Pair({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="shrink-0 text-fg-subtle">{label}</dt>
      <dd className={`min-w-0 break-words text-fg ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
