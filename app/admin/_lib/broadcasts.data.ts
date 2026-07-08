import "server-only";
import { createAdminClient } from "@/app/lib/supabase/server";
import {
  type Broadcast,
  type BroadcastAudience,
  type BroadcastSeverity,
  relativeTime,
} from "./broadcasts";

type Row = {
  id: string;
  title: string;
  body: string;
  severity: BroadcastSeverity;
  audience: BroadcastAudience;
  country: string | null;
  sent_by_name: string | null;
  created_at: string;
  expires_at: string | null;
  archived_at: string | null;
};

function mapRow(row: Row): Broadcast {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    severity: row.severity,
    audience: row.audience,
    country: (row.country ?? "ALL").toUpperCase(),
    sentByName: row.sent_by_name,
    createdAt: row.created_at,
    createdAgo: relativeTime(row.created_at),
    expiresAt: row.expires_at,
    isExpired: row.expires_at ? new Date(row.expires_at).getTime() <= Date.now() : false,
    archivedAt: row.archived_at,
    isArchived: row.archived_at != null,
  };
}

export async function getBroadcasts(): Promise<Broadcast[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("broadcasts")
    .select(
      "id, title, body, severity, audience, country, sent_by_name, created_at, expires_at, archived_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(`Failed to load broadcasts: ${error.message}`);
  return (data as Row[]).map(mapRow);
}
