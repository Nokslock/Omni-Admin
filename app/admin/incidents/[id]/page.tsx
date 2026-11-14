import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import {
  statusMeta,
  typeColor,
  severityMeta,
  verificationSource,
} from "../../_lib/incidents";
import {
  getIncidentById,
  getIncidents,
  getReporterAccount,
} from "../../_lib/incidents.data";
import { getIncidentFeedback } from "../../_lib/feedback.data";
import { getIncidentComments } from "../../_lib/moderation.data";
import { CommentCard } from "../../moderation/CommentCard";
import { TypeIcon } from "../../_lib/icons";
import { MiniMap } from "./MiniMap";
import { ProBadge } from "../../_components/ProBadge";
import { IncidentActions } from "./IncidentActions";
import { ReportPhoto, RestoreInstantButton } from "./ReportMedia";

type RouteParams = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { id } = await params;
  const inc = await getIncidentById(id);
  return {
    title: inc ? `${inc.id} — ${inc.title}` : "Incident — Kasala Admin",
  };
}

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export default async function IncidentDetailPage({ params }: RouteParams) {
  await connection();
  const { id } = await params;
  const incident = await getIncidentById(id);
  if (!incident) notFound();

  const color = typeColor[incident.type];
  const status = statusMeta[incident.status];
  const sev = severityMeta[incident.severity];
  const reporterInitials = incident.reporter
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const [nearbyAll, feedback, account, comments] = await Promise.all([
    getIncidents(),
    getIncidentFeedback(incident.id),
    incident.reporterId ? getReporterAccount(incident.reporterId) : null,
    getIncidentComments(incident.id),
  ]);
  const nearby = nearbyAll
    .filter((i) => i.id !== incident.id)
    .map((i) => ({ inc: i, d: haversineKm(incident.coords, i.coords) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3);

  const confirmCount = feedback.filter((f) => f.kind === "confirm").length;
  const flagCount = feedback.filter((f) => f.kind === "flag").length;

  return (
    <div className="flex min-h-full flex-col bg-bg text-fg">

      {/* Sticky page header */}
      <div className="sticky top-0 z-40 border-b border-border bg-bg-card/95 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-5 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <Link
              href="/admin/incidents"
              className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-fg-muted transition-colors hover:border-border-strong hover:bg-bg-elev hover:text-fg"
              aria-label="Back to incidents"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>

            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: `color-mix(in oklab, ${color} 16%, transparent)`, color }}
            >
              <TypeIcon type={incident.type} size={22} />
            </span>

            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold" style={{ color }}>{incident.typeLabel}</span>
                <span className="text-fg-subtle">·</span>
                <span className="font-mono text-fg-muted">{incident.id}</span>
                <Pill color={status.color} label={status.label} />
                <Pill color={sev.color} label={sev.label} />
                {incident.proVerified && <Pill color="#e0a526" label="Pro · instant" />}
              </div>
              <h1 className="mt-1.5 text-2xl font-semibold leading-tight tracking-tight">
                {incident.title}
              </h1>
              <p className="mt-1 text-xs text-fg-muted">
                Reported {incident.reportedAt} · {incident.reportedDate} · {incident.location}
              </p>
            </div>
          </div>

          <IncidentActions
            id={incident.id}
            status={incident.status}
            severity={incident.severity}
            proVerified={incident.proVerified}
          />
        </div>
      </div>

      {/* Body */}
      <main className="w-full max-w-7xl flex-1 px-5 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Situation summary */}
            <section className="rounded-2xl border border-border bg-bg-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">Situation summary</h2>
                <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-fg-subtle">
                  Severity · {sev.label}
                </span>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-fg">
                {incident.description}
              </p>

              <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ok" />
                  <span>{verificationSource(incident, confirmCount)}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      incident.attested ? "bg-ok" : "bg-fg-subtle"
                    }`}
                  />
                  <span className={incident.attested ? "" : "text-fg-muted"}>
                    {incident.attested
                      ? "The reporter confirmed it was happening in their area and accepted responsibility for the report."
                      : "The reporter didn't confirm it was happening in their area (older app version)."}
                  </span>
                </div>
              </div>

              {incident.note && (
                <div className="mt-4 rounded-xl border border-border bg-bg-elev/40 p-3.5">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-fg-subtle">
                    Reporter&rsquo;s note
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm text-fg">{incident.note}</p>
                </div>
              )}

              {incident.photoUrl && (
                <div className="mt-4">
                  <ReportPhoto incidentId={incident.id} url={incident.photoUrl} />
                </div>
              )}
            </section>

            {/* Community feedback */}
            <section className="rounded-2xl border border-border bg-bg-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">
                  Community feedback
                </h2>
                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-ok">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {confirmCount} confirmed
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-warn">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <line x1="4" y1="22" x2="4" y2="2" />
                      <path d="M4 4h15l-3 4 3 4H4" />
                    </svg>
                    {flagCount} flagged
                  </span>
                </div>
              </div>

              {feedback.length === 0 ? (
                <p className="mt-4 text-sm text-fg-muted">
                  No reports from the community yet.
                </p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {feedback.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-start gap-3 rounded-xl border border-border bg-bg-elev/40 p-3.5"
                    >
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                          f.kind === "confirm"
                            ? "bg-ok/15 text-ok"
                            : "bg-warn/15 text-warn"
                        }`}
                        aria-label={f.kind}
                      >
                        {f.kind === "confirm" ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <line x1="4" y1="22" x2="4" y2="2" />
                            <path d="M4 4h15l-3 4 3 4H4" />
                          </svg>
                        )}
                      </span>
                      <div className="min-w-0 flex-1 leading-tight">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span className="text-sm font-medium text-fg">
                            {f.userName ?? "Anonymous user"}
                          </span>
                          {f.userEmail && (
                            <span className="text-[11px] text-fg-muted">{f.userEmail}</span>
                          )}
                          <span className="ml-auto font-mono text-[11px] text-fg-subtle">
                            {relTime(f.createdAt)}
                          </span>
                        </div>
                        <div className="mt-0.5 text-[11px] uppercase tracking-wider text-fg-subtle">
                          {f.kind === "confirm" ? "Confirmed this incident" : "Flagged as false / inaccurate"}
                        </div>
                        {f.reason && (
                          <p className="mt-1.5 text-sm text-fg">{f.reason}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Comments */}
            <section className="rounded-2xl border border-border bg-bg-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">Comments</h2>
                <span className="text-xs text-fg-muted">
                  {comments.length} · including hidden ones
                </span>
              </div>
              {comments.length === 0 ? (
                <p className="mt-4 text-sm text-fg-muted">No comments.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {comments.map((c) => (
                    <CommentCard key={c.id} comment={c} showIncident={false} />
                  ))}
                </ul>
              )}
            </section>

            {/* Location */}
            <section className="overflow-hidden rounded-2xl border border-border bg-bg-card">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold tracking-tight">Location</h2>
              </div>
              <div className="grid gap-4 p-4 sm:grid-cols-[1.6fr_1fr]">
                <MiniMap incident={incident} />
                <div className="flex flex-col justify-center gap-4 text-sm">
                  <Field label="Address" value={incident.location} />
                  <Field label="District" value={incident.address} />
                  <Field
                    label="Coordinates"
                    value={`${incident.coords.lat.toFixed(4)}°N · ${incident.coords.lng.toFixed(4)}°E`}
                    mono
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-bg-card">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold tracking-tight">Reporter</h2>
              </div>
              <div className="flex items-center gap-3 px-5 py-4">
                {account?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={account.avatarUrl}
                    alt=""
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-info text-sm font-semibold text-white">
                    {reporterInitials || "?"}
                  </span>
                )}
                <div className="min-w-0 leading-tight">
                  <div className="flex items-center gap-1.5 text-sm font-semibold">
                    {account?.name ?? incident.reporter}
                    {account?.isPro && <ProBadge />}
                  </div>
                  {account && account.name !== incident.reporter && (
                    <div className="text-[11px] text-fg-muted">
                      Shown publicly as {incident.reporter}
                    </div>
                  )}
                </div>
              </div>
              {account ? (
                <div className="space-y-3 border-t border-border px-5 py-4 text-sm">
                  <Field label="Email" value={account.email ?? "—"} />
                  <Field label="Phone" value={account.phone ?? "Not given"} mono={!!account.phone} />
                  {(account.status === "suspended" || account.deactivated) && (
                    <div className="rounded-md bg-danger/10 px-3 py-2 text-xs text-danger">
                      {account.status === "suspended"
                        ? "This account is suspended."
                        : "This account is deactivated and waiting to be erased."}
                    </div>
                  )}
                  {(account.isPro || account.strikes > 0 || account.instantOffAt) && (
                    <div>
                      <div className="text-[11px] font-medium uppercase tracking-wider text-fg-subtle">
                        Instant verification
                      </div>
                      <div className="mt-0.5">
                        {account.instantOffAt
                          ? `Switched off ${new Date(account.instantOffAt).toLocaleDateString()} after 3 false alarms`
                          : `On · ${account.strikes} of 3 false alarms`}
                      </div>
                      {account.instantOffAt && (
                        <RestoreInstantButton userId={account.id} incidentId={incident.id} />
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="border-t border-border px-5 py-4 text-xs text-fg-muted">
                  {incident.reporterId
                    ? "The reporter's account no longer exists."
                    : "Filed without an account (or the account was erased)."}
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-border bg-bg-card">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold tracking-tight">Nearby reports</h2>
              </div>
              {nearby.length === 0 ? (
                <p className="px-5 py-4 text-sm text-fg-muted">No other reports.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {nearby.map(({ inc, d }) => (
                    <li key={inc.id}>
                      <Link
                        href={`/admin/incidents/${inc.id}`}
                        className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-bg-elev/50"
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{
                            background: `color-mix(in oklab, ${typeColor[inc.type]} 14%, transparent)`,
                            color: typeColor[inc.type],
                          }}
                        >
                          <TypeIcon type={inc.type} size={14} />
                        </span>
                        <div className="min-w-0 flex-1 leading-tight">
                          <div className="truncate text-xs font-semibold">{inc.title}</div>
                          <div className="font-mono text-[10px] text-fg-muted">
                            {inc.id} · ~{d.toFixed(1)} km away
                          </div>
                        </div>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-fg-subtle" aria-hidden>
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── helpers ─────────────────────────────── */

function relTime(iso: string): string {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Pill({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
      style={{
        color,
        borderColor: `color-mix(in oklab, ${color} 28%, transparent)`,
        background: `color-mix(in oklab, ${color} 10%, transparent)`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-fg-subtle">{label}</div>
      <div className={`mt-0.5 text-sm text-fg ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
