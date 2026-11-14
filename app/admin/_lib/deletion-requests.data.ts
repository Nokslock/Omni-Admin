import "server-only";
import { createAdminClient } from "@/app/lib/supabase/server";
import {
  type DeletionRequest,
  type DeletionStatus,
  type ScheduledDeletion,
  relativeTime,
} from "./deletion-requests";

type Row = {
  id: string;
  email: string;
  phone: string | null;
  reason: string | null;
  user_id: string | null;
  status: DeletionStatus;
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  completed_at: string | null;
  created_at: string;
  users:
    | {
        id: string;
        name: string;
        joined_date: string;
        reports: number;
        deletion_requested_at: string | null;
        deletion_scheduled_for: string | null;
      }
    | null;
  reviewer: { id: string; name: string } | null;
};

function mapRow(row: Row): DeletionRequest {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    reason: row.reason,
    userId: row.users?.id ?? row.user_id ?? null,
    userName: row.users?.name ?? null,
    userJoined: row.users?.joined_date ?? null,
    userReports: row.users?.reports ?? null,
    deactivatedAt: row.users?.deletion_requested_at ?? null,
    erasesAt: row.users?.deletion_scheduled_for ?? null,
    status: row.status,
    adminNote: row.admin_note,
    reviewedBy: row.reviewer?.id ?? row.reviewed_by ?? null,
    reviewedByName: row.reviewer?.name ?? null,
    reviewedAt: row.reviewed_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    createdAgo: relativeTime(row.created_at),
  };
}

export async function getDeletionRequests(): Promise<DeletionRequest[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("account_deletion_requests")
    .select(
      `
      id, email, phone, reason, user_id, status, admin_note,
      reviewed_by, reviewed_at, completed_at, created_at,
      users:users!account_deletion_requests_user_id_fkey ( id, name, joined_date, reports, deletion_requested_at, deletion_scheduled_for ),
      reviewer:users!account_deletion_requests_reviewed_by_fkey ( id, name )
      `,
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(`Failed to load deletion requests: ${error.message}`);
  }
  return (data as unknown as Row[]).map(mapRow);
}

export async function getPendingDeletionCount(): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("account_deletion_requests")
    .select("id", { count: "exact", head: true })
    .in("status", ["pending", "in_progress"]);
  if (error) return 0;
  return count ?? 0;
}

/**
 * Every account currently deactivated and waiting to be erased, including
 * the ones people deleted from inside the app (which never create a request).
 */
export async function getScheduledDeletions(
  requests: DeletionRequest[],
): Promise<ScheduledDeletion[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, deletion_requested_at, deletion_scheduled_for")
    .not("deletion_scheduled_for", "is", null)
    .order("deletion_scheduled_for", { ascending: true })
    .limit(200);
  if (error) {
    throw new Error(`Failed to load scheduled deletions: ${error.message}`);
  }
  const covered = new Set(
    requests
      .filter((r) => r.status === "pending" || r.status === "in_progress")
      .map((r) => r.userId),
  );
  return (data ?? []).map((u) => ({
    userId: u.id as string,
    name: (u.name as string) ?? "—",
    email: (u.email as string | null) ?? null,
    deactivatedAt: u.deletion_requested_at as string,
    erasesAt: u.deletion_scheduled_for as string,
    hasRequest: covered.has(u.id as string),
  }));
}
