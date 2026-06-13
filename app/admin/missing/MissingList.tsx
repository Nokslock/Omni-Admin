"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  missingStatusMeta,
  type MissingRequest,
  type MissingStatus,
} from "../_lib/missing";
import { setMissingStatus, setMissingAudience } from "./actions";
import { COUNTRIES, WORLDWIDE, countryLabel } from "@/app/lib/countries";

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

  const total = requests.length;
  const pct = (n: number) => (total ? `${Math.round((n / total) * 100)}%` : "0%");
  const stats: { label: string; value: number; sub?: string }[] = [
    { label: "Total requests", value: total },
    { label: "Pending review", value: counts.pending, sub: pct(counts.pending) },
    { label: "Approved", value: counts.approved, sub: pct(counts.approved) },
    { label: "Resolved", value: counts.resolved, sub: pct(counts.resolved) },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Page header */}
      <div className="border-b border-border bg-bg px-6 pb-5 pt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <nav className="mb-3 flex items-center gap-1.5 text-xs text-fg-muted">
              <span>Admin</span>
              <span className="text-fg-subtle">›</span>
              <span className="text-fg">Missing persons</span>
            </nav>
            <h1 className="text-3xl font-semibold tracking-tight">Missing-person requests</h1>
            <p className="mt-1 text-sm text-fg-muted">
              Review and approve requests submitted from the mobile app ·{" "}
              <span className="font-semibold text-fg">{filtered.length}</span> shown
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-bg-card px-5 py-4">
              <div className="text-xs text-fg-muted">{s.label}</div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-2xl font-semibold tracking-tight">{s.value.toLocaleString()}</span>
                {s.sub && (
                  <span className="font-mono text-[11px] text-fg-muted">{s.sub} of total</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-bg px-6">
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
              className={`inline-flex h-11 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors ${
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

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-fg-muted">
            No {tab === "all" ? "" : tab} requests.
          </p>
        ) : (
          <ul className="mx-auto max-w-5xl space-y-3">
            {filtered.map((r) => (
              <RequestCard key={r.id} request={r} />
            ))}
          </ul>
        )}
      </div>
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

  async function changeAudience(country: string) {
    setBusy(true);
    const res = await setMissingAudience(r.id, country);
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
            <div className="flex flex-wrap items-center gap-2">
              {r.originCountry && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-elev px-2 py-1 text-[11px] font-medium text-fg-muted">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  From {countryLabel(r.originCountry)}
                </span>
              )}
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

          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-bg-elev/40 px-3 py-2.5">
            <label className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-fg-muted">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Audience
            </label>
            <select
              value={r.audienceCountry}
              disabled={busy}
              onChange={(e) => changeAudience(e.target.value)}
              className="h-8 rounded-md border border-border bg-bg-card px-2 text-xs text-fg focus:border-fg-muted focus:outline-none focus:ring-1 focus:ring-fg-muted/30 disabled:opacity-50"
            >
              <option value={WORLDWIDE}>🌍 Worldwide</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
            <span className="text-[11px] text-fg-muted">
              {r.audienceCountry === WORLDWIDE
                ? "Visible everywhere"
                : `Only visible in ${countryLabel(r.audienceCountry)}`}
            </span>
          </div>

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
