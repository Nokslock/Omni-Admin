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
    reporterPhone: row.reporter_phone,
    reportedAt: relativeTime(row.reported_at),
    reportedDate: new Date(row.reported_at).toISOString().slice(0, 10),
    location: row.location,
    address: row.address,
    coords: { lat: row.lat, lng: row.lng },
    mapXY: { x: row.map_x, y: row.map_y },
  };
}

const COLUMNS =
  "id, type, title, description, status, severity, reporter_name, reporter_id, reporter_phone, location, address, lat, lng, map_x, map_y, reported_at";

// Auto-resolve any incident reported more than 24h ago that hasn't already been
// closed (resolved / false_alarm). Throttled so we run at most once a minute,
// even when the admin auto-refresh polls more often.
const AUTO_RESOLVE_AFTER_MS = 24 * 60 * 60 * 1000;
const AUTO_RESOLVE_THROTTLE_MS = 60 * 1000;
let lastAutoResolveAt = 0;

async function autoResolveStaleIncidents(
  supabase: ReturnType<typeof createAdminClient>,
): Promise<void> {
  const now = Date.now();
  if (now - lastAutoResolveAt < AUTO_RESOLVE_THROTTLE_MS) return;
  lastAutoResolveAt = now;
  const cutoff = new Date(now - AUTO_RESOLVE_AFTER_MS).toISOString();
  await supabase
    .from("incidents")
    .update({ status: "resolved" })
    .lt("reported_at", cutoff)
    .in("status", ["active", "investigating"]);
}

export async function getIncidents(): Promise<Incident[]> {
  const supabase = createAdminClient();
  await autoResolveStaleIncidents(supabase);
  const { data, error } = await supabase
    .from("incidents")
    .select(COLUMNS)
    .order("reported_at", { ascending: false });

  if (error) throw new Error(`Failed to load incidents: ${error.message}`);
  return (data as IncidentRow[]).map(mapRow);
}

export async function getIncidentById(id: string): Promise<Incident | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("incidents")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load incident: ${error.message}`);
  return data ? mapRow(data as IncidentRow) : null;
}
