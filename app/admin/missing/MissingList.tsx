"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  missingStatusMeta,
  type MissingRequest,
  type MissingStatus,
  type Sighting,
} from "../_lib/missing";
import { setMissingStatus, setMissingAudience } from "./actions";
import { toast } from "../_components/toast";
import { COUNTRIES, WORLDWIDE, countryLabel } from "@/app/lib/countries";
import { EmptyState, GUTTER, PageHeader, Segmented, StatGrid, StatTile, StatusPill, btn } from "../_components/ui";

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

export function MissingList({
  requests,
  initialTab,
}: {
  requests: MissingRequest[];
  initialTab?: string;
}) {
  const [tab, setTab] = useState<Tab>(
    tabs.find((t) => t.id === initialTab)?.id ?? "pending",
  );

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
  const stats: { label: string; value: number; sub?: string; color?: string; tab: Tab }[] = [
    { label: "Total requests", value: total, color: "var(--info)", tab: "all" },
    { label: "Pending review", value: counts.pending, sub: pct(counts.pending), color: missingStatusMeta.pending.color, tab: "pending" },
    { label: "Approved", value: counts.approved, sub: pct(counts.approved), color: missingStatusMeta.approved.color, tab: "approved" },
    { label: "Resolved", value: counts.resolved, sub: pct(counts.resolved), color: missingStatusMeta.resolved.color, tab: "resolved" },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Missing persons"
        description="Requests sent from the mobile app. Approve one to broadcast it; mark it resolved once the person is found."
      >
        <StatGrid>
          {stats.map((s) => (
            <StatTile
              key={s.label}
              label={s.label}
              value={s.value.toLocaleString()}
              sub={s.sub && `${s.sub} of total`}
              color={s.color}
              active={tab === s.tab}
              onClick={() => setTab(s.tab)}
            />
          ))}
        </StatGrid>
      </PageHeader>

      <div className={`pb-5 ${GUTTER}`}>
        <Segmented
          label="Status"
          value={tab}
          onChange={setTab}
          items={tabs.map((t) => ({
            id: t.id,
            label: t.label,
            count: t.id === "all" ? requests.length : (counts[t.id as MissingStatus] ?? 0),
          }))}
        />
      </div>

      {/* Content */}
      <div className={`flex-1 pb-8 ${GUTTER}`}>
        {filtered.length === 0 ? (
          <EmptyState
            title={tab === "pending" ? "Nothing waiting for review" : `No ${tab === "all" ? "" : `${tab} `}requests`}
            hint="Requests sent from the mobile app land here."
          />
        ) : (
          <ul className="max-w-6xl space-y-4">
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
    if ("error" in res) toast(res.error, "error");
    else router.refresh();
  }

  async function changeAudience(country: string) {
    setBusy(true);
    const res = await setMissingAudience(r.id, country);
    setBusy(false);
    if ("error" in res) toast(res.error, "error");
    else router.refresh();
  }

  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-bg-card">
      <div className="flex flex-col gap-5 p-5 sm:flex-row">
        {r.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={r.imageUrl}
            alt={r.title}
            className="h-40 w-40 shrink-0 rounded-xl border border-border object-cover"
          />
        ) : (
          <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-xl border border-dashed border-border-strong bg-bg-elev text-[11px] uppercase tracking-wider text-fg-subtle">
            No photo
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    r.requestType === "notice"
                      ? "bg-info/10 text-info"
                      : "bg-danger/10 text-danger"
                  }`}
                >
                  {r.requestType === "notice" ? "Community notice" : "Missing person"}
                </span>
                {r.sightings.length > 0 && (
                  <span className="rounded-full bg-warn/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warn">
                    {r.sightings.length} {r.sightings.length === 1 ? "sighting" : "sightings"}
                  </span>
                )}
              </div>
              <h3 className="truncate text-lg font-semibold tracking-tight text-fg">{r.title}</h3>
              <p className="mt-0.5 text-xs text-fg-muted">
                Submitted {relTime(r.createdAt)} ·{" "}
                {r.submitterName ?? "Unknown user"}
                {r.submitterEmail ? ` · ${r.submitterEmail}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {r.originCountry && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-elev px-2.5 py-1 text-xs font-medium text-fg-muted">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  From {countryLabel(r.originCountry)}
                </span>
              )}
              <StatusPill color={meta.color} label={meta.label} />
            </div>
          </div>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-fg">{r.message}</p>

          <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2.5 rounded-xl border border-border bg-bg-elev/40 px-4 py-3.5 text-[13px] sm:grid-cols-2">
            {r.contactHidden ? (
              <Pair
                label="Contact"
                value={`${r.privatePhone ?? "—"} (hidden from the public)`}
                mono
              />
            ) : (
              <Pair label="Contact" value={r.contactInfo || "—"} mono />
            )}
            {r.age != null && <Pair label="Age" value={String(r.age)} />}
            {r.sex && <Pair label="Sex" value={r.sex === "female" ? "Female" : "Male"} />}
            {r.clothing && <Pair label="Last wearing" value={r.clothing} />}
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

          {r.sightings.length > 0 && <Sightings items={r.sightings} />}

          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-bg-elev/40 px-4 py-2.5">
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
              className="h-9 rounded-lg border border-border bg-bg-card px-2.5 text-[13px] text-fg focus:border-fg-muted focus:outline-none focus:ring-1 focus:ring-fg-muted/30 disabled:opacity-50"
            >
              <option value={WORLDWIDE}>🌍 Worldwide</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
            <span className="text-xs text-fg-muted">
              {r.audienceCountry === WORLDWIDE
                ? "Visible everywhere"
                : `Only visible in ${countryLabel(r.audienceCountry)}`}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <button
              onClick={() => change("approved")}
              disabled={busy || r.status === "approved"}
              className={btn.ok}
            >
              Approve
            </button>
            <button
              onClick={() => change("rejected")}
              disabled={busy || r.status === "rejected"}
              className={btn.danger}
            >
              Reject
            </button>
            <button
              onClick={() => change("resolved")}
              disabled={busy || r.status === "resolved"}
              className={btn.info}
            >
              Mark resolved
            </button>
            {r.imageUrl && (
              <a
                href={r.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btn.ghost} ml-auto`}
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

/** "I've seen them" reports from the public. Only staff can read these. */
function Sightings({ items }: { items: Sighting[] }) {
  return (
    <details className="mt-3 rounded-xl border border-warn/30 bg-warn/5 px-4 py-3" open>
      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-warn">
        Sightings from the public ({items.length})
      </summary>
      <ul className="mt-3 space-y-2.5">
        {items.map((s) => (
          <li key={s.id} className="rounded-lg border border-border bg-bg-card px-3 py-2.5 text-xs">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-medium text-fg">
                {s.byName ?? "Former member"}
                {s.byEmail && <span className="font-normal text-fg-muted"> · {s.byEmail}</span>}
                {s.byPhone && (
                  <span className="font-mono font-normal text-fg-muted"> · {s.byPhone}</span>
                )}
              </span>
              <span className="text-fg-subtle">{relTime(s.createdAt)}</span>
            </div>
            {s.note && <p className="mt-1.5 whitespace-pre-wrap text-sm text-fg">{s.note}</p>}
            {s.lat != null && s.lng != null && (
              <a
                href={`https://www.google.com/maps?q=${s.lat},${s.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-block font-mono text-fg-muted hover:text-fg hover:underline"
              >
                {s.lat.toFixed(4)}, {s.lng.toFixed(4)} · open map
              </a>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}
