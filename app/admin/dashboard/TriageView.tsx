"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CONFIRM_THRESHOLD,
  severityMeta,
  typeColor,
  type Incident,
  type IncidentStatus,
} from "../_lib/incidents";
import type { IncidentFeedback } from "../_lib/feedback.data";
import { updateIncidentStatus } from "../incidents/actions";
import { toast } from "../_components/toast";
import { ProBadge } from "../_components/ProBadge";
import { MiniMap } from "../incidents/[id]/MiniMap";
import { CountryFilter } from "./CountryFilter";
import { loadIncidentFeedback } from "./actions";
import {
  STATUS_UI,
  formatDistance,
  haversineKm,
  reportedMs,
  shortAge,
  shortName,
} from "./dashboard-utils";

type Tab = "unverified" | "active" | "all";

const TABS: { id: Tab; label: string }[] = [
  { id: "unverified", label: "Unverified" },
  { id: "active", label: "Investigating" },
  { id: "all", label: "All" },
];

const CORROBORATION_KM = 1;
const CORROBORATION_MS = 3_600_000;
const NEARBY_KM = 3;
const DAY_MS = 86_400_000;

function tabFor(status: IncidentStatus): Tab {
  return status === "active" ? "active" : status === "unverified" ? "unverified" : "all";
}

export function TriageView({
  incidents,
  allIncidents,
  selectedId,
  onSelect,
  onBack,
  country,
  onCountryChange,
  nowMs,
}: {
  /** Incidents in the current country filter. */
  incidents: Incident[];
  /** Every incident, for reporter history and corroboration. */
  allIncidents: Incident[];
  selectedId: string;
  onSelect: (id: string) => void;
  onBack: () => void;
  country: string;
  onCountryChange: (code: string) => void;
  nowMs: number;
}) {
  const router = useRouter();
  const selected = allIncidents.find((i) => i.id === selectedId) ?? null;
  const [tab, setTab] = useState<Tab>(() => (selected ? tabFor(selected.status) : "unverified"));
  const [busy, setBusy] = useState<IncidentStatus | null>(null);
  const [feedback, setFeedback] = useState<Record<string, IncidentFeedback[] | "error">>({});
  const listRef = useRef<HTMLUListElement>(null);

  const live = useMemo(
    () =>
      incidents
        .filter((i) => i.status === "unverified" || i.status === "active")
        .sort((a, b) => reportedMs(a) - reportedMs(b)), // oldest waiting first
    [incidents],
  );
  const counts = {
    unverified: live.filter((i) => i.status === "unverified").length,
    active: live.filter((i) => i.status === "active").length,
    all: live.length,
  };
  const queue = tab === "all" ? live : live.filter((i) => i.status === tab);

  // Load community feedback for the selected incident (cached per id).
  useEffect(() => {
    if (!selectedId || feedback[selectedId]) return;
    let cancelled = false;
    loadIncidentFeedback(selectedId).then((res) => {
      if (cancelled) return;
      setFeedback((f) => ({ ...f, [selectedId]: "error" in res ? "error" : res.feedback }));
    });
    return () => {
      cancelled = true;
    };
  }, [selectedId, feedback]);

  // Keep the selected row in view when moving with J/K.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-id="${CSS.escape(selectedId)}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [selectedId]);

  const primary: { status: IncidentStatus; label: string; done: string } | null =
    selected?.status === "unverified"
      ? { status: "active", label: "Verify", done: "Incident verified" }
      : selected?.status === "active"
        ? { status: "resolved", label: "Resolve", done: "Incident resolved" }
        : null;
  const canMarkFalse = selected?.status === "unverified" || selected?.status === "active";

  async function setStatus(next: IncidentStatus, done: string) {
    if (!selected || busy) return;
    // Work out where to go next before the list changes under us.
    const idx = queue.findIndex((i) => i.id === selected.id);
    const leavesQueue = tab !== "all" && next !== selected.status;
    const following = leavesQueue ? (queue[idx + 1] ?? queue[idx - 1]) : null;

    setBusy(next);
    const res = await updateIncidentStatus(selected.id, next);
    setBusy(null);
    if ("error" in res) {
      toast(res.error, "error");
      return;
    }
    toast(done, "success");
    if (following) onSelect(following.id);
    router.refresh();
  }

  function step(delta: number) {
    if (queue.length === 0) return;
    const idx = queue.findIndex((i) => i.id === selectedId);
    const next = queue[Math.min(queue.length - 1, Math.max(0, (idx < 0 ? 0 : idx) + delta))];
    if (next) onSelect(next.id);
  }

  // Keyboard triage: J/K move, V verifies, F marks false, Esc returns to the map.
  const keyRef = useRef({ step, setStatus, primary, canMarkFalse, onBack });
  useEffect(() => {
    keyRef.current = { step, setStatus, primary, canMarkFalse, onBack };
  });
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return;
      if (document.querySelector('[role="dialog"]')) return;
      const k = keyRef.current;
      const key = e.key.toLowerCase();
      if (key === "j") k.step(1);
      else if (key === "k") k.step(-1);
      else if (key === "v" && k.primary?.status === "active") k.setStatus("active", "Incident verified");
      else if (key === "f" && k.canMarkFalse) k.setStatus("false_alarm", "Marked as false alarm");
      else if (key === "escape") k.onBack();
      else return;
      e.preventDefault();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="grid h-full grid-cols-[240px_minmax(0,1fr)] overflow-hidden lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_340px]">
      {/* ── Queue ─────────────────────────────────────────── */}
      <aside className="flex min-h-0 flex-col border-r border-border bg-bg-card">
        <div className="space-y-3 px-4 pt-4">
          <CountryFilter value={country} onChange={onCountryChange} />
          <div className="flex items-center gap-1 border-b border-border">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`-mb-px inline-flex h-10 items-center gap-2 border-b-2 px-2.5 text-sm font-semibold transition-colors ${
                  tab === t.id ? "border-danger text-fg" : "border-transparent text-fg-muted hover:text-fg"
                }`}
              >
                {t.label}
                <span className="rounded bg-bg-elev px-1.5 font-mono text-[11px] text-fg-muted">{counts[t.id]}</span>
              </button>
            ))}
          </div>
        </div>

        <ul ref={listRef} className="min-h-0 flex-1 overflow-y-auto">
          {queue.length === 0 && (
            <li className="px-5 py-12 text-center text-sm text-fg-muted">Nothing waiting here.</li>
          )}
          {queue.map((inc) => {
            const active = inc.id === selectedId;
            const age = nowMs - reportedMs(inc);
            const sev = severityMeta[inc.severity];
            return (
              <li key={inc.id} data-id={inc.id}>
                <button
                  type="button"
                  onClick={() => onSelect(inc.id)}
                  className={`flex w-full items-start gap-3 border-b border-l-[3px] border-b-border px-4 py-3.5 text-left transition-colors ${
                    active ? "border-l-danger bg-bg-elev" : "border-l-transparent hover:bg-bg-elev/50"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide">
                      <span className="font-semibold" style={{ color: typeColor[inc.type] }}>
                        {inc.typeLabel}
                      </span>
                      <span className="normal-case text-fg-subtle">{sev.label}</span>
                    </div>
                    <div className="mt-1 truncate text-[15px] font-semibold">{inc.title}</div>
                    <div className="mt-0.5 truncate text-sm text-fg-muted">
                      {inc.location} · {shortName(inc.reporter)}
                    </div>
                  </div>
                  <div className="shrink-0 text-right leading-tight">
                    <div className={`text-base font-bold ${age > 12 * 3_600_000 ? "text-danger" : "text-warn"}`}>
                      {shortAge(age)}
                    </div>
                    <div className="text-xs text-fg-muted">waiting</div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-4 py-3 text-xs text-fg-muted">
          <span className="inline-flex items-center gap-1"><Kbd>J</Kbd><Kbd>K</Kbd> next / prev</span>
          <span className="inline-flex items-center gap-1"><Kbd>V</Kbd> verify</span>
          <span className="inline-flex items-center gap-1"><Kbd>F</Kbd> false</span>
          <span className="inline-flex items-center gap-1"><Kbd>Esc</Kbd> map</span>
        </div>
      </aside>

      {/* ── Detail ────────────────────────────────────────── */}
      {selected ? (
        <Detail
          key={`detail-${selected.id}`}
          incident={selected}
          allIncidents={allIncidents}
          feedback={feedback[selected.id]}
          nowMs={nowMs}
          onBack={onBack}
          primary={primary}
          canMarkFalse={canMarkFalse}
          busy={busy}
          onStatus={setStatus}
        />
      ) : (
        <div className="flex items-center justify-center text-sm text-fg-muted">Select an incident.</div>
      )}

      {/* ── Location + nearby ─────────────────────────────── */}
      {selected && <Surroundings key={`around-${selected.id}`} incident={selected} allIncidents={allIncidents} nowMs={nowMs} />}
    </div>
  );
}

function Detail({
  incident,
  allIncidents,
  feedback,
  nowMs,
  onBack,
  primary,
  canMarkFalse,
  busy,
  onStatus,
}: {
  incident: Incident;
  allIncidents: Incident[];
  feedback: IncidentFeedback[] | "error" | undefined;
  nowMs: number;
  onBack: () => void;
  primary: { status: IncidentStatus; label: string; done: string } | null;
  canMarkFalse: boolean;
  busy: IncidentStatus | null;
  onStatus: (s: IncidentStatus, done: string) => void;
}) {
  const color = typeColor[incident.type];
  const status = STATUS_UI[incident.status];
  const t0 = reportedMs(incident);

  const reporterHistory = useMemo(() => {
    if (!incident.reporterId) return null;
    const mine = allIncidents.filter((i) => i.reporterId === incident.reporterId);
    const decided = mine.filter((i) => i.status !== "unverified");
    const verified = decided.filter((i) => i.status === "active" || i.status === "resolved").length;
    return {
      total: mine.length,
      pct: decided.length ? Math.round((verified / decided.length) * 100) : null,
    };
  }, [incident.reporterId, allIncidents]);

  const similar = useMemo(
    () =>
      allIncidents.filter(
        (i) =>
          i.id !== incident.id &&
          Math.abs(reportedMs(i) - t0) <= CORROBORATION_MS &&
          haversineKm(i.coords, incident.coords) <= CORROBORATION_KM,
      ).length,
    [allIncidents, incident.id, incident.coords, t0],
  );

  const confirms = Array.isArray(feedback) ? feedback.filter((f) => f.kind === "confirm").length : null;
  const flags = Array.isArray(feedback) ? feedback.filter((f) => f.kind === "flag").length : null;

  const activity = useMemo(() => {
    const rows: { key: string; text: string; at: number; tone?: string }[] = [
      { key: "reported", text: "Reported via mobile app", at: t0 },
    ];
    if (incident.proVerified) rows.push({ key: "pro", text: "Verified instantly · Pro reporter vouched", at: t0 });
    if (Array.isArray(feedback)) {
      for (const f of feedback) {
        rows.push({
          key: f.id,
          text:
            f.kind === "confirm"
              ? `Confirmed by ${f.userName ?? "a user"}`
              : `Flagged by ${f.userName ?? "a user"}${f.reason ? ` — ${f.reason}` : ""}`,
          at: new Date(f.createdAt).getTime(),
          tone: f.kind === "flag" ? "text-danger" : "text-ok",
        });
      }
    }
    return rows.sort((a, b) => a.at - b.at);
  }, [feedback, incident.proVerified, t0]);

  return (
    <section className="flex min-h-0 flex-col bg-bg">
      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6 animate-swap-in">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to map
        </button>

        <div className="flex flex-wrap items-center gap-3 font-mono text-[13px]">
          <span className="font-semibold uppercase tracking-wide" style={{ color }}>
            {incident.typeLabel}
          </span>
          <span className="text-fg-muted">{incident.id}</span>
          <span
            className="rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: status.color, borderColor: `color-mix(in oklab, ${status.color} 45%, transparent)` }}
          >
            {status.label}
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{incident.title}</h1>
        <p className="mt-2 text-base text-fg-muted">
          {incident.location} · reported {shortAge(nowMs - t0)} ago
        </p>
        {incident.description && (
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-fg-muted">{incident.description}</p>
        )}
        {incident.note && (
          <p className="mt-3 max-w-3xl rounded-lg border border-border bg-bg-card px-4 py-3 text-sm italic text-fg-muted">
            “{incident.note}”
          </p>
        )}

        <div className="mt-6 grid overflow-hidden rounded-xl border border-border bg-bg-card md:grid-cols-3">
          <Stat label="Reporter">
            <div className="flex items-center gap-1.5 text-lg font-semibold">
              {shortName(incident.reporter)}
              {incident.reporterPro && <ProBadge />}
            </div>
            <div className="mt-0.5 text-sm">
              {reporterHistory ? (
                <span className={reporterHistory.pct !== null && reporterHistory.pct >= 70 ? "text-ok" : "text-warn"}>
                  {reporterHistory.total} report{reporterHistory.total === 1 ? "" : "s"}
                  {reporterHistory.pct !== null && ` · ${reporterHistory.pct}% verified`}
                </span>
              ) : (
                <span className="text-fg-muted">Anonymous report</span>
              )}
            </div>
            {incident.reporterPhone !== "—" && (
              <div className="mt-1 font-mono text-xs text-fg-muted">{incident.reporterPhone}</div>
            )}
          </Stat>
          <Stat label="Corroboration">
            <div className="text-lg font-semibold">
              {similar} similar report{similar === 1 ? "" : "s"}
            </div>
            <div className="mt-0.5 text-sm text-fg-muted">within 1 km, ±1 hour</div>
          </Stat>
          <Stat label="Community" last>
            <div className="text-lg font-semibold">
              {confirms === null ? "…" : `${confirms} of ${CONFIRM_THRESHOLD} confirmations`}
            </div>
            <div className="mt-0.5 text-sm text-fg-muted">
              {feedback === "error" ? "Couldn't load feedback" : flags === null ? "Loading…" : `${flags} flag${flags === 1 ? "" : "s"}`}
            </div>
          </Stat>
        </div>

        <h2 className="mt-8 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-fg-muted">Media</h2>
        {incident.photoUrl ? (
          <a href={incident.photoUrl} target="_blank" rel="noreferrer" className="mt-3 block max-w-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={incident.photoUrl}
              alt="Photo taken with the report"
              className="aspect-[4/3] w-full rounded-xl border border-border object-cover"
            />
          </a>
        ) : (
          <div className="mt-3 flex h-32 max-w-md items-center justify-center rounded-xl border border-dashed border-border-strong text-sm text-fg-subtle">
            No photo attached
          </div>
        )}

        <h2 className="mt-8 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-fg-muted">Activity</h2>
        <ul className="mt-3 max-w-3xl space-y-2.5">
          {activity.map((a) => (
            <li key={a.key} className="flex items-center gap-3 text-[15px]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-fg-muted" />
              <span className={`flex-1 ${a.tone ?? ""}`}>{a.text}</span>
              <span className="shrink-0 text-sm text-fg-muted">{shortAge(nowMs - a.at)} ago</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex shrink-0 items-center gap-3 border-t border-border bg-bg-card px-8 py-4">
        {primary && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => onStatus(primary.status, primary.done)}
            className="inline-flex h-12 items-center rounded-xl bg-danger px-7 text-base font-semibold text-white shadow-[0_8px_28px_-8px_var(--danger)] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy === primary.status ? "Saving…" : primary.label}
          </button>
        )}
        {canMarkFalse && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => onStatus("false_alarm", "Marked as false alarm")}
            className="inline-flex h-12 items-center rounded-xl border border-border-strong bg-bg-elev px-7 text-base font-semibold transition-colors hover:bg-bg disabled:opacity-60"
          >
            {busy === "false_alarm" ? "Saving…" : "Mark false"}
          </button>
        )}
        {!primary && !canMarkFalse && (
          <span className="text-sm text-fg-muted">This report is closed ({STATUS_UI[incident.status].label.toLowerCase()}).</span>
        )}
        <Link
          href={`/admin/incidents/${incident.id}`}
          className="ml-auto inline-flex h-12 items-center gap-1.5 rounded-xl border border-border-strong px-6 text-base font-semibold transition-colors hover:bg-bg-elev"
        >
          Full details
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

function Surroundings({
  incident,
  allIncidents,
  nowMs,
}: {
  incident: Incident;
  allIncidents: Incident[];
  nowMs: number;
}) {
  const nearby = useMemo(
    () =>
      allIncidents
        .filter((i) => i.id !== incident.id && nowMs - reportedMs(i) <= DAY_MS)
        .map((i) => ({ inc: i, km: haversineKm(incident.coords, i.coords) }))
        .filter((n) => n.km <= NEARBY_KM)
        .sort((a, b) => a.km - b.km)
        .slice(0, 8),
    [allIncidents, incident.id, incident.coords, nowMs],
  );

  return (
    <aside className="hidden min-h-0 flex-col overflow-y-auto border-l border-border bg-bg-card animate-swap-in xl:flex">
      <div className="border-b border-border p-4">
        <MiniMap incident={incident} />
        <div className="mt-2 font-mono text-xs text-fg-muted">
          {incident.address || incident.location}
        </div>
      </div>
      <h2 className="px-5 pb-2 pt-5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-fg-muted">
        Nearby · last 24h
      </h2>
      {nearby.length === 0 ? (
        <p className="px-5 py-3 text-sm text-fg-muted">Nothing else reported within {NEARBY_KM} km.</p>
      ) : (
        <ul>
          {nearby.map(({ inc, km }) => (
            <li key={inc.id} className="border-b border-border last:border-b-0">
              <Link href={`/admin/incidents/${inc.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-bg-elev/50">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: typeColor[inc.type] }} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {inc.typeLabel} · {formatDistance(km)}
                </span>
                <span className="shrink-0 text-xs text-fg-muted">{shortAge(nowMs - reportedMs(inc))} ago</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

function Stat({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`px-5 py-4 ${last ? "" : "border-b border-border md:border-b-0 md:border-r"}`}>
      <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-fg-muted">{label}</div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border-strong px-1 font-mono text-[10px] text-fg">
      {children}
    </kbd>
  );
}
