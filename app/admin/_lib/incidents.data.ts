import "server-only";
import { createAdminClient } from "@/app/lib/supabase/server";
import {
  normalizeIncidentType,
  normalizeSeverity,
  typeLabels,
  type Incident,
  type IncidentStatus,
} from "./incidents";

// Raw shape coming out of Postgres. We type type/severity as `string` rather
// than the strict union because legacy or future rows can carry values the
// web app doesn't know about yet — we normalize them in mapRow().
type IncidentRow = {
  id: string;
  type: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: string | null;
  reporter_name: string;
  reporter_id: string | null;
  reporter_phone: string;
  location: string;
  address: string;
  lat: number;
  lng: number;
  map_x: number;
  map_y: number;
  reported_at: string;
  pro_verified: boolean | null;
  reporter_attested: boolean | null;
  reporter_note: string | null;
  photo_url: string | null;
  /** The reporter's profile, for their phone (reports don't store one). */
  reporter: { phone: string | null; verified: boolean | null } | null;
};

function relativeTime(iso: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

function mapRow(row: IncidentRow): Incident {
  const type = normalizeIncidentType(row.type);
  const severity = normalizeSeverity(row.severity);
  return {
    id: row.id,
    type,
    typeLabel: typeLabels[type],
    title: row.title,
    description: row.description,
    status: row.status,
    severity,
    reporter: row.reporter_name,
    reporterId: row.reporter_id ?? null,
    reporterPhone: row.reporter?.phone ?? "—",
    reporterPro: row.reporter?.verified === true,
    reportedAt: relativeTime(row.reported_at),
    reportedDate: new Date(row.reported_at).toISOString().slice(0, 10),
    reportedAtIso: new Date(row.reported_at).toISOString(),
    location: row.location,
    address: row.address,
    coords: { lat: row.lat, lng: row.lng },
    mapXY: { x: row.map_x, y: row.map_y },
    proVerified: row.pro_verified === true,
    attested: row.reporter_attested === true,
    note: row.reporter_note,
    photoUrl: row.photo_url,
  };
}

const COLUMNS =
  "id, type, title, description, status, severity, reporter_name, reporter_id, reporter_phone, location, address, lat, lng, map_x, map_y, reported_at, pro_verified, reporter_attested, reporter_note, photo_url, reporter:users!reporter_id(phone, verified)";

// Closing stale reports (verified ones after 24 hours, unverified ones after
// 48) is done by the database's auto_resolve_stale_incidents job every 10
// minutes. Pages only read; opening the admin never changes data.

export async function getIncidents(): Promise<Incident[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("incidents")
    .select(COLUMNS)
    .order("reported_at", { ascending: false });

  if (error) throw new Error(`Failed to load incidents: ${error.message}`);
  return (data as unknown as IncidentRow[]).map(mapRow);
}

export async function getIncidentById(id: string): Promise<Incident | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("incidents")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load incident: ${error.message}`);
  return data ? mapRow(data as unknown as IncidentRow) : null;
}

/** What the incident page shows about the person who filed a report. */
export type ReporterAccount = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  isPro: boolean;
  /** Instant verification switched off after 3 false alarms. */
  instantOffAt: string | null;
  /** False alarms on their instantly-verified reports since the last restore. */
  strikes: number;
  deactivated: boolean;
};

export async function getReporterAccount(
  reporterId: string,
): Promise<ReporterAccount | null> {
  const supabase = createAdminClient();
  const { data: u } = await supabase
    .from("users")
    .select(
      "id, name, email, phone, avatar_url, status, instant_verify_off_at, instant_verify_reset_at, deletion_requested_at",
    )
    .eq("id", reporterId)
    .maybeSingle();
  if (!u) return null;

  const [{ count: proCount }, { count: strikes }] = await Promise.all([
    supabase
      .from("pro_subscriptions")
      .select("user_id", { count: "exact", head: true })
      .eq("user_id", reporterId)
      .gt("expires_at", new Date().toISOString()),
    supabase
      .from("incidents")
      .select("id", { count: "exact", head: true })
      .eq("reporter_id", reporterId)
      .eq("pro_verified", true)
      .eq("status", "false_alarm")
      .gt("reported_at", u.instant_verify_reset_at ?? "1970-01-01T00:00:00Z"),
  ]);

  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    avatarUrl: u.avatar_url,
    status: u.status,
    isPro: (proCount ?? 0) > 0,
    instantOffAt: u.instant_verify_off_at,
    strikes: strikes ?? 0,
    deactivated: u.deletion_requested_at != null,
  };
}
