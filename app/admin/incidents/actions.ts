"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/server";
import type { IncidentStatus, IncidentType, Severity } from "../_lib/incidents";

export type NewIncidentInput = {
  title: string;
  type: string;
  severity: string;
  status: string;
  description: string;
  location: string;
  address: string;
  reporterId: string | null; // null = anonymous
  lat: number;
  lng: number;
};

export type CreateIncidentResult = { ok: true; id: string } | { error: string };

function genId(): string {
  return `INC-${Math.random().toString(16).slice(2, 6).toUpperCase()}`;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

// Web-Mercator projection onto the admin SVG canvas (0–2000 x, 0–1200 y).
// Works for any lat/lng on Earth — longitude maps linearly, latitude uses
// the Mercator formula so high-latitude cities aren't squashed.
function projectX(lng: number) {
  return Math.round(clamp(((lng + 180) / 360) * 2000, 0, 2000));
}
function projectY(lat: number) {
  const rad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + rad / 2));
  return Math.round(clamp((1 - (mercN + Math.PI) / (2 * Math.PI)) * 1200, 0, 1200));
}

export async function createIncident(
  input: NewIncidentInput,
): Promise<CreateIncidentResult> {
  const text = [
    input.title,
    input.type,
    input.severity,
    input.status,
    input.description,
    input.location,
    input.address,
  ];
  if (text.some((v) => !v || !v.trim())) {
    return { error: "Please fill in all required fields." };
  }
  if (Number.isNaN(input.lat) || Number.isNaN(input.lng)) {
    return { error: "Latitude and longitude must be valid numbers." };
  }

  const supabase = createAdminClient();

  // Resolve the reporter (a linked user, or anonymous).
  let reporterName = "Anonymous";
  let reporterId: string | null = null;
  if (input.reporterId) {
    const { data: user } = await supabase
      .from("users")
      .select("name")
      .eq("id", input.reporterId)
      .maybeSingle();
    if (!user) return { error: "Selected reporter was not found." };
    reporterName = user.name;
    reporterId = input.reporterId;
  }

  const id = genId();
  const { error } = await supabase.from("incidents").insert({
    id,
    type: input.type,
    title: input.title.trim(),
    description: input.description.trim(),
    status: input.status,
    severity: input.severity,
    reporter_name: reporterName,
    reporter_id: reporterId,
    reporter_phone: "",
    location: input.location.trim(),
    address: input.address.trim(),
    lat: input.lat,
    lng: input.lng,
    map_x: projectX(input.lng),
    map_y: projectY(input.lat),
  });

  if (error) return { error: `Failed to create incident: ${error.message}` };

  revalidatePath("/admin/incidents");
  revalidatePath("/admin/dashboard");
  return { ok: true, id };
}

export type IncidentActionResult = { ok: true } | { error: string };

const VALID_STATUSES = ["active", "unverified", "resolved", "false_alarm"];

export async function updateIncidentStatus(
  id: string,
  status: string,
): Promise<IncidentActionResult> {
  if (!VALID_STATUSES.includes(status)) {
    return { error: "Invalid status." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("incidents").update({ status }).eq("id", id);
  if (error) return { error: `Failed to update status: ${error.message}` };

  revalidatePath("/admin/incidents");
  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/incidents/${id}`);
  return { ok: true };
}

const VALID_SEVERITIES = ["critical", "high", "medium", "info", "resolved"];

export async function updateIncidentSeverity(
  id: string,
  severity: string,
): Promise<IncidentActionResult> {
  if (!VALID_SEVERITIES.includes(severity)) {
    return { error: "Invalid severity." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("incidents").update({ severity }).eq("id", id);
  if (error) return { error: `Failed to update severity: ${error.message}` };

  revalidatePath("/admin/incidents");
  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/incidents/${id}`);
  return { ok: true };
}

export async function deleteIncident(id: string): Promise<IncidentActionResult> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("incidents").delete().eq("id", id);
  if (error) return { error: `Failed to delete incident: ${error.message}` };

  revalidatePath("/admin/incidents");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}

export type BatchDeleteResult = { ok: true; deleted: number } | { error: string };

export async function deleteIncidents(ids: string[]): Promise<BatchDeleteResult> {
  if (!ids.length) return { error: "No incidents selected." };
  if (ids.length > 500) return { error: "Cannot delete more than 500 incidents at once." };

  const supabase = createAdminClient();
  const { error, count } = await supabase
    .from("incidents")
    .delete({ count: "exact" })
    .in("id", ids);

  if (error) return { error: `Batch delete failed: ${error.message}` };

  revalidatePath("/admin/incidents");
  revalidatePath("/admin/dashboard");
  return { ok: true, deleted: count ?? ids.length };
}

export type ReporterOption = { id: string; name: string };

export async function getReporters(): Promise<ReporterOption[]> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("users").select("id, name").order("name");
  return (data as ReporterOption[] | null) ?? [];
}

export type ReporterIncident = {
  id: string;
  title: string;
  type: IncidentType;
  severity: Severity;
  status: IncidentStatus;
  reportedAt: string;
  confirms: number;
  flags: number;
};

type ReporterIncidentRow = {
  id: string;
  title: string;
  type: IncidentType;
  severity: Severity;
  status: IncidentStatus;
  reported_at: string;
};

export async function getIncidentsByReporter(
  userId: string,
): Promise<ReporterIncident[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("incidents")
    .select("id, title, type, severity, status, reported_at")
    .eq("reporter_id", userId)
    .order("reported_at", { ascending: false });

  const rows = (data as ReporterIncidentRow[] | null) ?? [];
  if (rows.length === 0) return [];

  // Tally community feedback (confirm / flag) for just this user's incidents.
  const ids = rows.map((r) => r.id);
  const { data: feedback } = await supabase
    .from("incident_feedback")
    .select("incident_id, kind")
    .in("incident_id", ids);

  const counts = new Map<string, { confirms: number; flags: number }>();
  for (const f of (feedback as { incident_id: string; kind: string }[] | null) ?? []) {
    const c = counts.get(f.incident_id) ?? { confirms: 0, flags: 0 };
    if (f.kind === "confirm") c.confirms += 1;
    else if (f.kind === "flag") c.flags += 1;
    counts.set(f.incident_id, c);
  }

  return rows.map((r) => {
    const c = counts.get(r.id) ?? { confirms: 0, flags: 0 };
    return {
      id: r.id,
      title: r.title,
      type: r.type,
      severity: r.severity,
      status: r.status,
      reportedAt: r.reported_at,
      confirms: c.confirms,
      flags: c.flags,
    };
  });
}
