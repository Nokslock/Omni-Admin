import "server-only";
import { createAdminClient } from "@/app/lib/supabase/server";
import type { MissingRequest, MissingStatus, Sighting } from "./missing";

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
  request_type: "missing" | "notice" | null;
  age: number | null;
  sex: "female" | "male" | null;
  clothing: string | null;
  contact_hidden: boolean | null;
};

type SightingRow = {
  id: string;
  request_id: string;
  user_id: string;
  note: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
};

type UserLookup = {
  auth_id: string | null;
  name: string;
  email: string;
  phone: string | null;
};

export async function getMissingRequests(): Promise<MissingRequest[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("missing_person_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load missing-person requests: ${error.message}`);
  const rows = (data ?? []) as Row[];

  const ids = rows.map((r) => r.id);
  const [{ data: privateRows }, { data: sightingRows }] = ids.length
    ? await Promise.all([
        // Hidden numbers live apart from the public row (only staff read them).
        supabase
          .from("missing_person_private_contacts")
          .select("request_id, phone")
          .in("request_id", ids),
        supabase
          .from("missing_person_sightings")
          .select("id, request_id, user_id, note, lat, lng, created_at")
          .in("request_id", ids)
          .order("created_at", { ascending: false }),
      ])
    : [{ data: [] }, { data: [] }];
  const privatePhone = new Map(
    (privateRows ?? []).map((p) => [p.request_id as string, p.phone as string]),
  );
  const sightings = (sightingRows ?? []) as SightingRow[];

  // Resolve submitter and sighting names from public.users (joined on auth_id).
  const authIds = [
    ...new Set(
      [...rows.map((r) => r.submitted_by), ...sightings.map((s) => s.user_id)].filter(
        (v): v is string => !!v,
      ),
    ),
  ];
  const lookup: Record<string, { name: string; email: string; phone: string | null }> = {};
  if (authIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("auth_id, name, email, phone")
      .in("auth_id", authIds);
    for (const u of (users ?? []) as UserLookup[]) {
      if (u.auth_id) lookup[u.auth_id] = { name: u.name, email: u.email, phone: u.phone };
    }
  }
  const sightingsFor = (requestId: string): Sighting[] =>
    sightings
      .filter((s) => s.request_id === requestId)
      .map((s) => ({
        id: s.id,
        note: s.note,
        lat: s.lat,
        lng: s.lng,
        createdAt: s.created_at,
        byName: lookup[s.user_id]?.name ?? null,
        byEmail: lookup[s.user_id]?.email ?? null,
        byPhone: lookup[s.user_id]?.phone ?? null,
      }));

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
    requestType: r.request_type === "notice" ? "notice" : "missing",
    age: r.age,
    sex: r.sex,
    clothing: r.clothing,
    contactHidden: r.contact_hidden === true,
    privatePhone: privatePhone.get(r.id) ?? null,
    sightings: sightingsFor(r.id),
  }));
}
