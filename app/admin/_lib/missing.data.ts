import "server-only";
import { createAdminClient } from "@/app/lib/supabase/server";
import type { MissingRequest, MissingStatus } from "./missing";

type Row = {
  id: string;
  submitted_by: string | null;
  title: string;
  message: string;
  image_url: string | null;
  contact_info: string;
  last_seen_lat: number | null;
  last_seen_lng: number | null;
  last_seen_at: string | null;
  last_seen_place: string | null;
  status: MissingStatus;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  broadcast_at: string | null;
  created_at: string;
  origin_country: string | null;
  audience_country: string;
};

type UserLookup = { auth_id: string | null; name: string; email: string };

export async function getMissingRequests(): Promise<MissingRequest[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("missing_person_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load missing-person requests: ${error.message}`);
  const rows = (data ?? []) as Row[];

  // Resolve submitter display name + email from public.users (joined on auth_id).
  const authIds = [...new Set(rows.map((r) => r.submitted_by).filter((v): v is string => !!v))];
  const lookup: Record<string, { name: string; email: string }> = {};
  if (authIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("auth_id, name, email")
      .in("auth_id", authIds);
    for (const u of (users ?? []) as UserLookup[]) {
      if (u.auth_id) lookup[u.auth_id] = { name: u.name, email: u.email };
    }
  }

  return rows.map((r) => ({
    id: r.id,
    submittedBy: r.submitted_by,
    submitterName: r.submitted_by ? lookup[r.submitted_by]?.name ?? null : null,
    submitterEmail: r.submitted_by ? lookup[r.submitted_by]?.email ?? null : null,
    title: r.title,
    message: r.message,
    imageUrl: r.image_url,
    contactInfo: r.contact_info,
    lastSeenLat: r.last_seen_lat,
    lastSeenLng: r.last_seen_lng,
    lastSeenAt: r.last_seen_at,
    lastSeenPlace: r.last_seen_place,
    status: r.status,
    adminNotes: r.admin_notes,
    reviewedBy: r.reviewed_by,
    reviewedAt: r.reviewed_at,
    broadcastAt: r.broadcast_at,
    createdAt: r.created_at,
    originCountry: r.origin_country,
    audienceCountry: r.audience_country ?? "ALL",
  }));
}
