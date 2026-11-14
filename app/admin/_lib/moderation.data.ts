import "server-only";
import { createAdminClient } from "@/app/lib/supabase/server";
import type { ModComment } from "./moderation";

type CommentRow = {
  id: string;
  body: string;
  created_at: string;
  incident_id: string;
  author: {
    id: string;
    name: string;
    email: string | null;
    verified: boolean | null;
    status: string | null;
  } | null;
  incident: { title: string } | null;
};

const SELECT =
  "id, body, created_at, incident_id, author:users!user_id(id, name, email, verified, status), incident:incidents!incident_id(title)";

type ReportRow = { comment_id: string; reporter_id: string; created_at: string };

async function withReports(rows: CommentRow[]): Promise<ModComment[]> {
  if (rows.length === 0) return [];
  const supabase = createAdminClient();
  const { data: reports } = await supabase
    .from("incident_comment_reports")
    .select("comment_id, reporter_id, created_at")
    .in(
      "comment_id",
      rows.map((r) => r.id),
    );
  const byComment = new Map<string, ReportRow[]>();
  for (const r of (reports ?? []) as ReportRow[]) {
    const list = byComment.get(r.comment_id) ?? [];
    list.push(r);
    byComment.set(r.comment_id, list);
  }
  const reporterIds = [...new Set((reports ?? []).map((r) => r.reporter_id as string))];
  const names = new Map<string, string>();
  if (reporterIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, name")
      .in("id", reporterIds);
    for (const u of users ?? []) names.set(u.id as string, u.name as string);
  }

  return rows.map((row) => {
    const list = byComment.get(row.id) ?? [];
    const last = list.map((r) => r.created_at).sort().at(-1) ?? null;
    return {
      id: row.id,
      body: row.body,
      createdAt: row.created_at,
      incidentId: row.incident_id,
      incidentTitle: row.incident?.title ?? null,
      author: row.author
        ? {
            id: row.author.id,
            name: row.author.name,
            email: row.author.email,
            pro: row.author.verified === true,
            suspended: row.author.status === "suspended",
          }
        : null,
      reports: list.length,
      lastReportedAt: last,
      reporterNames: list.map((r) => names.get(r.reporter_id) ?? "Former member"),
    };
  });
}

/** Comments at least one person reported, most reported first. */
export async function getReportedComments(): Promise<ModComment[]> {
  const supabase = createAdminClient();
  const { data: reported, error } = await supabase
    .from("incident_comment_reports")
    .select("comment_id")
    .limit(2000);
  if (error) throw new Error(`Failed to load reports: ${error.message}`);
  const ids = [...new Set((reported ?? []).map((r) => r.comment_id as string))];
  if (ids.length === 0) return [];

  const { data, error: cErr } = await supabase
    .from("incident_comments")
    .select(SELECT)
    .in("id", ids.slice(0, 500));
  if (cErr) throw new Error(`Failed to load comments: ${cErr.message}`);
  const list = await withReports((data ?? []) as unknown as CommentRow[]);
  return list.sort(
    (a, b) =>
      b.reports - a.reports ||
      (b.lastReportedAt ?? "").localeCompare(a.lastReportedAt ?? ""),
  );
}

/** The newest comments anywhere, for keeping an eye on things. */
export async function getRecentComments(limit = 100): Promise<ModComment[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("incident_comments")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Failed to load comments: ${error.message}`);
  return withReports((data ?? []) as unknown as CommentRow[]);
}

/** Every comment on one incident, oldest first, including hidden ones. */
export async function getIncidentComments(incidentId: string): Promise<ModComment[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("incident_comments")
    .select(SELECT)
    .eq("incident_id", incidentId)
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) return [];
  return withReports((data ?? []) as unknown as CommentRow[]);
}

/** How many comments are waiting with at least one report. */
export async function countReportedComments(): Promise<number> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("incident_comment_reports")
    .select("comment_id")
    .limit(5000);
  if (error) return 0;
  return new Set((data ?? []).map((r) => r.comment_id as string)).size;
}
