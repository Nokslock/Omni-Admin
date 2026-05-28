import "server-only";
import { createAdminClient } from "@/app/lib/supabase/server";
import {
  typeLabels,
  type Incident,
  type IncidentStatus,
  type IncidentType,
  type Severity,
} from "./incidents";

type IncidentRow = {
  id: string;
  type: IncidentType;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: Severity;
  reporter_name: string;
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
  return {
    id: row.id,
    type: row.type,
    typeLabel: typeLabels[row.type],
    title: row.title,
    description: row.description,
    status: row.status,
    severity: row.severity,
    reporter: row.reporter_name,
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
  "id, type, title, description, status, severity, reporter_name, reporter_phone, location, address, lat, lng, map_x, map_y, reported_at";

export async function getIncidents(): Promise<Incident[]> {
  const supabase = createAdminClient();
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
