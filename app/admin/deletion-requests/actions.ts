"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/server";
import { createSessionClient } from "@/app/lib/supabase/session";
import type { DeletionStatus } from "../_lib/deletion-requests";

export type ActionResult = { ok: true } | { error: string };

const VALID: DeletionStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "rejected",
];

/**
 * Update the status of a deletion request. When set to "completed" we also
 * delete the matched public.users row (auth.users follows via on-delete) so
 * the user's data is actually gone — not just queued.
 */
export async function setDeletionStatus(
  id: string,
  status: string,
  adminNote?: string,
): Promise<ActionResult> {
  if (!VALID.includes(status as DeletionStatus)) {
    return { error: "Invalid status." };
  }

  const session = await createSessionClient();
  const {
    data: { user },
  } = await session.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  const supabase = createAdminClient();
  const { data: adminRow } = await supabase
    .from("users")
    .select("id, role")
    .eq("auth_id", user.id)
    .maybeSingle();
  if (!adminRow || adminRow.role !== "admin") {
    return { error: "Admin privileges required." };
  }

  const now = new Date().toISOString();

  // Fetch the request to know which user (if any) to delete on completion.
  const { data: req, error: fetchErr } = await supabase
    .from("account_deletion_requests")
    .select("id, user_id, email")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr || !req) return { error: "Request not found." };

  const patch: Record<string, string | null> = {
    status,
    reviewed_by: adminRow.id,
    reviewed_at: now,
  };
  if (adminNote !== undefined) {
    patch.admin_note = adminNote.trim() || null;
  }
  if (status === "completed") {
    patch.completed_at = now;
  }

  // If marking completed, delete the actual user record. The auth.users row
  // is linked via auth_id with on-delete cascade — but the safer order is to
  // remove the auth user first via the admin API, then delete the profile.
  if (status === "completed") {
    let userIdToDelete = req.user_id;
    if (!userIdToDelete) {
      // Try to find by email if we hadn't linked it at submit time.
      const { data: maybeUser } = await supabase
        .from("users")
        .select("id, auth_id")
        .eq("email", req.email)
        .maybeSingle();
      userIdToDelete = maybeUser?.id ?? null;
    }

    if (userIdToDelete) {
      const { data: profile } = await supabase
        .from("users")
        .select("auth_id")
        .eq("id", userIdToDelete)
        .maybeSingle();

      if (profile?.auth_id) {
        // Best-effort: ignore errors so a half-deleted auth row doesn't block
        // the rest of the flow.
        await supabase.auth.admin.deleteUser(profile.auth_id);
      }
      await supabase.from("users").delete().eq("id", userIdToDelete);
    }
  }

  const { error } = await supabase
    .from("account_deletion_requests")
    .update(patch)
    .eq("id", id);

  if (error) {
    console.error("setDeletionStatus failed:", error);
    return { error: "Failed to update the request." };
  }

  revalidatePath("/admin/deletion-requests");
  return { ok: true };
}
