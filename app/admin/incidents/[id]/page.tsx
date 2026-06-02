import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { AdminNav } from "../../_components/AdminNav";
import { statusMeta, typeColor, severityMeta } from "../../_lib/incidents";
import { getIncidentById, getIncidents } from "../../_lib/incidents.data";
import { TypeIcon } from "../../_lib/icons";
import { MiniMap } from "./MiniMap";
import { IncidentActions } from "./IncidentActions";

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

  const nearby = (await getIncidents())
    .filter((i) => i.id !== incident.id)
    .map((i) => ({ inc: i, d: haversineKm(incident.coords, i.coords) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3);

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

          <IncidentActions id={incident.id} status={incident.status} severity={incident.severity} />
        </div>
      </div>

      {/* Body */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Situation summary */}
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
            </section>

            {/* Location */}
            <section className="overflow-hidden rounded-xl border border-border bg-bg-card">
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
            <section className="rounded-xl border border-border bg-bg-card">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold tracking-tight">Reporter</h2>
              </div>
              <div className="flex items-center gap-3 px-5 py-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-info text-sm font-semibold text-white">
                  {reporterInitials || "?"}
                </span>
                <div className="text-sm font-semibold">{incident.reporter}</div>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-bg-card">
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

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-fg-subtle">{label}</div>
      <div className={`mt-0.5 text-sm text-fg ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
