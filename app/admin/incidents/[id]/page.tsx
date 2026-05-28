import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { AdminNav } from "../../_components/AdminNav";
import { statusMeta, typeColor, severityMeta, type Incident } from "../../_lib/incidents";
import { getIncidentById, getIncidents } from "../../_lib/incidents.data";
import { TypeIcon } from "../../_lib/icons";
import { NotesPanel } from "./NotesPanel";
import { MiniMap } from "./MiniMap";

type RouteParams = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { id } = await params;
  const inc = await getIncidentById(id);
  return {
    title: inc ? `${inc.id} — ${inc.title}` : "Incident — Omni Admin",
  };
}

export default async function IncidentDetailPage({ params }: RouteParams) {
  await connection();
  const { id } = await params;
  const incident = await getIncidentById(id);
  if (!incident) notFound();

  const color = typeColor[incident.type];
  const status = statusMeta[incident.status];
  const sev = severityMeta[incident.severity];
  const reporterInitials = incident.reporter.split(" ").map((p) => p[0]).slice(0, 2).join("");

  // Nearby incidents (within mapXY radius, exclude self)
  const nearby = (await getIncidents())
    .filter((i) => i.id !== incident.id)
    .map((i) => {
      const dx = i.mapXY.x - incident.mapXY.x;
      const dy = i.mapXY.y - incident.mapXY.y;
      return { inc: i, d: Math.sqrt(dx * dx + dy * dy) };
    })
    .sort((a, b) => a.d - b.d)
    .slice(0, 3);

  const timeline = buildTimeline(incident);
  const tags = buildTags(incident);

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <AdminNav />

      {/* Sticky page header */}
      <div className="sticky top-16 z-40 border-b border-border bg-bg-card/95 backdrop-blur">
        <div className="px-6 pt-5">
          <nav className="flex items-center gap-1.5 text-xs text-fg-muted">
            <Link href="/admin/dashboard" className="hover:text-fg">Admin</Link>
            <span className="text-fg-subtle">›</span>
            <Link href="/admin/incidents" className="hover:text-fg">Incidents</Link>
            <span className="text-fg-subtle">›</span>
            <span className="font-mono text-fg">{incident.id}</span>
          </nav>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4 px-6 pb-5 pt-3">
          <div className="flex items-start gap-4">
            <Link
              href="/admin/incidents"
              className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-fg-muted hover:text-fg hover:border-border-strong transition-colors"
              aria-label="Back to incidents"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>

            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
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
              </div>
              <h1 className="mt-1.5 text-2xl font-semibold leading-tight tracking-tight">
                {incident.title}
              </h1>
              <p className="mt-1 text-xs text-fg-muted">
                Reported {incident.reportedAt} · {incident.reportedDate} · {incident.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-ok/40 bg-ok/10 px-3 text-sm font-medium text-ok hover:bg-ok/15 transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Mark Resolved
            </button>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-bg-card px-3 text-sm font-medium hover:border-border-strong transition-colors">
              Escalate
            </button>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-bg-card px-3 text-sm font-medium text-fg-muted hover:text-fg hover:border-border-strong transition-colors">
              False Alarm
            </button>
            <button
              aria-label="More actions"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-fg-muted hover:text-fg hover:border-border-strong transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <circle cx="5" cy="12" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="19" cy="12" r="1.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column: 2/3 */}
          <div className="space-y-6 lg:col-span-2">
            {/* Description */}
            <section className="rounded-xl border border-border bg-bg-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">Situation summary</h2>
                <span className="font-mono text-[10px] uppercase tracking-wider text-fg-subtle">
                  Severity · {sev.label}
                </span>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-fg">
                {incident.description}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatBlock label="ETA on scene" value="6 min" />
                <StatBlock label="Witnesses" value="3" />
                <StatBlock label="Confidence" value="High" />
                <StatBlock label="Auto-flag" value="None" />
              </div>
            </section>

            {/* Media */}
            <section className="rounded-xl border border-border bg-bg-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">Reporter media</h2>
                <span className="font-mono text-[10px] uppercase tracking-wider text-fg-subtle">
                  3 attachments
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { tint: color, label: "PHOTO 1", caption: "Wide · suspects fleeing" },
                  { tint: color, label: "PHOTO 2", caption: "Damaged storefront" },
                  { tint: color, label: "AUDIO", caption: "0:23 voice note", audio: true },
                ].map((m, i) => (
                  <MediaTile key={i} {...m} />
                ))}
              </div>
            </section>

            {/* Timeline */}
            <section className="rounded-xl border border-border bg-bg-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">Activity timeline</h2>
                <button className="text-xs text-fg-muted hover:text-fg">View full log →</button>
              </div>
              <ol className="mt-5 space-y-5">
                {timeline.map((ev, i) => (
                  <li key={i} className="relative flex gap-4">
                    {i !== timeline.length - 1 && (
                      <span className="absolute left-[11px] top-6 h-[calc(100%+0.75rem)] w-px bg-border" aria-hidden />
                    )}
                    <span
                      className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2"
                      style={{
                        borderColor: ev.color,
                        background: `color-mix(in oklab, ${ev.color} 18%, var(--bg-card))`,
                        color: ev.color,
                      }}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ background: ev.color }} />
                    </span>
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-sm font-medium text-fg">{ev.title}</span>
                        <span className="font-mono text-[11px] text-fg-subtle">{ev.time}</span>
                      </div>
                      {ev.detail && (
                        <p className="mt-1 text-sm text-fg-muted">{ev.detail}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Notes */}
            <NotesPanel />
          </div>

          {/* Right column: 1/3 */}
          <div className="space-y-6">
            <section className="overflow-hidden rounded-xl border border-border bg-bg-card">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold tracking-tight">Location</h2>
              </div>
              <div className="p-3">
                <MiniMap incident={incident} />
              </div>
              <div className="space-y-3 border-t border-border px-5 py-4 text-sm">
                <DL label="Address" value={incident.location} />
                <DL label="District" value={incident.address} />
                <DL
                  label="Coordinates"
                  value={`${incident.coords.lat.toFixed(4)}°N · ${incident.coords.lng.toFixed(4)}°E`}
                  mono
                />
                <DL label="GPS accuracy" value="±4m" mono />
              </div>
            </section>

            <section className="rounded-xl border border-border bg-bg-card">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold tracking-tight">Reporter</h2>
              </div>
              <div className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-info text-sm font-semibold text-white">
                    {reporterInitials}
                  </span>
                  <div className="leading-tight">
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                      {incident.reporter}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ok" aria-hidden>
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <div className="font-mono text-xs text-fg-muted">{incident.reporterPhone}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <ReporterStat value="91%" label="Reliable" />
                  <ReporterStat value="38" label="Reports" />
                  <ReporterStat value="17m" label="Joined" />
                </div>

                <div className="mt-4 flex gap-2">
                  <button className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-fg text-sm font-medium text-bg hover:opacity-90 transition-opacity">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    Call
                  </button>
                  <button className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-bg-card text-sm font-medium hover:border-border-strong transition-colors">
                    Message
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-bg-card">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold tracking-tight">Nearby reports</h2>
              </div>
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
                          {inc.id} · ~{(d / 100).toFixed(1)} km away
                        </div>
                      </div>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-fg-subtle" aria-hidden>
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-border bg-bg-card p-5">
              <h2 className="text-sm font-semibold tracking-tight">Tags</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full border border-border bg-bg-elev px-2.5 py-1 text-[11px] text-fg-muted"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── helpers / sub-components ─────────────────────────────── */

function Pill({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium"
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

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg-elev/50 px-3 py-2.5">
      <div className="font-mono text-[10px] uppercase tracking-wider text-fg-subtle">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-fg">{value}</div>
    </div>
  );
}

function DL({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-xs text-fg-muted">{label}</span>
      <span className={`text-right text-sm text-fg ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function ReporterStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg-elev/50 px-2 py-2">
      <div className="text-sm font-semibold text-fg">{value}</div>
      <div className="text-[10px] text-fg-muted">{label}</div>
    </div>
  );
}

function MediaTile({
  tint,
  label,
  caption,
  audio,
}: {
  tint: string;
  label: string;
  caption: string;
  audio?: boolean;
}) {
  return (
    <div className="group overflow-hidden rounded-lg border border-border bg-bg-elev">
      <div
        className="relative aspect-[4/3]"
        style={{
          background: `linear-gradient(135deg, color-mix(in oklab, ${tint} 22%, transparent), color-mix(in oklab, ${tint} 6%, transparent))`,
        }}
      >
        <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-fg-muted">
          {audio ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          )}
          <span className="mt-2 font-mono text-[10px] uppercase tracking-wider">{label}</span>
        </div>
      </div>
      <div className="border-t border-border px-2.5 py-2 text-[11px] text-fg-muted">{caption}</div>
    </div>
  );
}

function buildTimeline(incident: Incident) {
  const base = [
    { title: "Report received", detail: "Citizen one-tap report via mobile app.", time: incident.reportedAt, color: "#3b82f6" },
    { title: "Auto-verified", detail: "GPS + media checks passed within 5s.", time: "6m ago", color: "#22c55e" },
  ];
  if (incident.status === "investigating" || incident.status === "active") {
    base.push({
      title: "Operator assigned",
      detail: "A. Bello (L2) accepted ownership.",
      time: "5m ago",
      color: "#a855f7",
    });
  }
  if (incident.status === "investigating") {
    base.push({
      title: "Status → Under Investigation",
      detail: "Cross-referenced with 2 nearby reports of similar description.",
      time: "3m ago",
      color: "#f59e0b",
    });
  }
  if (incident.status === "resolved") {
    base.push(
      {
        title: "Responders dispatched",
        detail: "Local unit confirmed arrival on scene.",
        time: "1h ago",
        color: "#a855f7",
      },
      {
        title: "Status → Resolved",
        detail: "Confirmed resolved. No further action required.",
        time: "30m ago",
        color: "#22c55e",
      },
    );
  }
  if (incident.status === "false_alarm") {
    base.push({
      title: "Marked False Alarm",
      detail: "Verified non-incident. Reporter notified.",
      time: "20m ago",
      color: "#3b82f6",
    });
  }
  return base.reverse();
}

function buildTags(incident: Incident) {
  const map: Record<string, string[]> = {
    fire: ["fire", "smoke", "evacuation"],
    armed: ["armed", "motorbikes", "robbery"],
    crash: ["traffic", "collision", "lane-closure"],
    medical: ["medical", "emergency", "ambulance"],
    flood: ["flooding", "rainfall", "drainage"],
    traffic: ["gridlock", "congestion"],
    power: ["outage", "utility"],
    other: ["other"],
  };
  return [...(map[incident.type] ?? []), incident.address.toLowerCase().replace(/\s+/g, "-")];
}
