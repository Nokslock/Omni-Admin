import "server-only";
import { createAdminClient } from "@/app/lib/supabase/server";
import {
  type DeletionRequest,
  type DeletionStatus,
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
    | { id: string; name: string; joined_date: string; reports: number }
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
      users:users!account_deletion_requests_user_id_fkey ( id, name, joined_date, reports ),
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
