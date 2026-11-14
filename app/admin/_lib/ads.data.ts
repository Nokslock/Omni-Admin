import "server-only";
import { createAdminClient } from "@/app/lib/supabase/server";
import type { Ad, AdFormat, AdStatus } from "./ads";

type Row = {
  id: string;
  submitted_by: string | null;
  format: AdFormat | null;
  business_name: string;
  logo_url: string | null;
  banner_url: string | null;
  headline: string | null;
  body: string | null;
  link_url: string | null;
  cta_label: string;
  contact_phone: string | null;
  contact_email: string | null;
  country: string | null;
  starts_at: string | null;
  ends_at: string | null;
  status: AdStatus;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type AdsResult = { ads: Ad[]; tableMissing: boolean };

/** PostgREST answers this way until the ads migration has been run. */
function isMissingTable(err: { code?: string; message: string }): boolean {
  return err.code === "PGRST205" || err.code === "42P01" || /could not find the table/i.test(err.message);
}

export async function getAds(): Promise<AdsResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("ads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    if (isMissingTable(error)) return { ads: [], tableMissing: true };
    throw new Error(`Failed to load ads: ${error.message}`);
  }
  const rows = (data ?? []) as Row[];

  // Submitter and reviewer names live in public.users, keyed by auth_id.
  const authIds = [
    ...new Set(rows.flatMap((r) => [r.submitted_by, r.reviewed_by]).filter((v): v is string => !!v)),
  ];
  const people: Record<string, { name: string; email: string | null }> = {};
  if (authIds.length > 0) {
    const { data: users } = await supabase.from("users").select("auth_id, name, email").in("auth_id", authIds);
    for (const u of users ?? []) {
      if (u.auth_id) people[u.auth_id as string] = { name: u.name as string, email: (u.email as string) ?? null };
    }
  }

  return {
    tableMissing: false,
    ads: rows.map((r) => ({
      id: r.id,
      format: r.format === "banner" ? "banner" : "card",
      businessName: r.business_name,
      logoUrl: r.logo_url,
      bannerUrl: r.banner_url,
      headline: r.headline,
      body: r.body,
      linkUrl: r.link_url,
      ctaLabel: r.cta_label,
      contactPhone: r.contact_phone,
      contactEmail: r.contact_email,
      country: (r.country ?? "ALL").toUpperCase(),
      startsAt: r.starts_at,
      endsAt: r.ends_at,
      status: r.status,
      adminNotes: r.admin_notes,
      reviewedAt: r.reviewed_at,
      reviewerName: r.reviewed_by ? (people[r.reviewed_by]?.name ?? null) : null,
      createdAt: r.created_at,
      submitterName: r.submitted_by ? (people[r.submitted_by]?.name ?? null) : null,
      submitterEmail: r.submitted_by ? (people[r.submitted_by]?.email ?? null) : null,
    })),
  };
}

/** Requests waiting for review, for the sidebar badge. 0 until the table exists. */
export async function countPendingAds(): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("ads")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  if (error) return 0;
  return count ?? 0;
}
