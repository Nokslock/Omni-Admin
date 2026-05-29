"use server";

import { createAdminClient } from "@/app/lib/supabase/server";
import type { IncidentType, IncidentStatus, Severity } from "./_lib/incidents";

export type NotificationItem = {
  id: string;
  title: string;
  type: IncidentType;
  severity: Severity;
  status: IncidentStatus;
  reportedAt: string; // ISO timestamp
};

type Row = {
  id: string;
  title: string;
  type: IncidentType;
  severity: Severity;
  status: IncidentStatus;
  reported_at: string;
};

export async function getRecentIncidents(): Promise<NotificationItem[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("incidents")
    .select("id, title, type, severity, status, reported_at")
    .order("reported_at", { ascending: false })
    .limit(10);

  if (error) return [];

  return (data as Row[]).map((r) => ({
    id: r.id,
    title: r.title,
    type: r.type,
    severity: r.severity,
    status: r.status,
    reportedAt: r.reported_at,
  }));
}
