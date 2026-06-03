import "server-only";
import { createAdminClient } from "@/app/lib/supabase/server";

export type FeedbackKind = "flag" | "confirm";

export type IncidentFeedback = {
  id: string;
  kind: FeedbackKind;
  reason: string | null;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
};

type Row = {
  id: string;
  incident_id: string;
  user_id: string;
  kind: FeedbackKind;
  reason: string | null;
  created_at: string;
};

type UserLookup = { id: string; auth_id: string | null; name: string; email: string };

export async function getIncidentFeedback(
  incidentId: string,
): Promise<IncidentFeedback[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("incident_feedback")
    .select("*")
    .eq("incident_id", incidentId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load feedback: ${error.message}`);
  const rows = (data ?? []) as Row[];
  if (rows.length === 0) return [];

  // user_id may reference either auth.users.id (UUID) or public.users.id (text),
  // depending on what the mobile app submits — look up both ways.
  const ids = [...new Set(rows.map((r) => r.user_id).filter(Boolean))];
  const lookup: Record<string, { name: string; email: string }> = {};
  if (ids.length > 0) {
    const [{ data: byAuth }, { data: byId }] = await Promise.all([
      supabase.from("users").select("id, auth_id, name, email").in("auth_id", ids),
      supabase.from("users").select("id, auth_id, name, email").in("id", ids),
    ]);
    for (const u of ((byAuth ?? []) as UserLookup[])) {
      if (u.auth_id) lookup[u.auth_id] = { name: u.name, email: u.email };
    }
    for (const u of ((byId ?? []) as UserLookup[])) {
      lookup[u.id] = { name: u.name, email: u.email };
    }
  }

  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    reason: r.reason,
    createdAt: r.created_at,
    userName: lookup[r.user_id]?.name ?? null,
    userEmail: lookup[r.user_id]?.email ?? null,
  }));
}
