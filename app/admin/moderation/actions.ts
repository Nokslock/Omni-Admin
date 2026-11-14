"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/server";
import { getCurrentAdmin } from "../_lib/admin";

export type ModerationResult = { ok: true } | { error: string };

async function staffOnly(): Promise<ModerationResult | null> {
  const admin = await getCurrentAdmin();
  if (!admin || !["admin", "moderator"].includes(admin.role)) {
    return { error: "Admin or moderator privileges required." };
  }
  return null;
}

function refresh(incidentId?: string) {
  revalidatePath("/admin/moderation");
  if (incidentId) revalidatePath(`/admin/incidents/${incidentId}`);
}

/** Removes a comment for everyone. Its reports go with it. */
export async function deleteComment(
  commentId: string,
  incidentId?: string,
): Promise<ModerationResult> {
  const denied = await staffOnly();
  if (denied) return denied;
  const { error } = await createAdminClient()
    .from("incident_comments")
    .delete()
    .eq("id", commentId);
  if (error) return { error: `Couldn't delete the comment: ${error.message}` };
  refresh(incidentId);
  return { ok: true };
}

/**
 * Keeps a comment that was reported unfairly: clears its reports, so it's
 * visible to everyone again (and to the people who reported it).
 */
export async function dismissReports(
  commentId: string,
  incidentId?: string,
): Promise<ModerationResult> {
  const denied = await staffOnly();
  if (denied) return denied;
  const { error } = await createAdminClient()
    .from("incident_comment_reports")
    .delete()
    .eq("comment_id", commentId);
  if (error) return { error: `Couldn't clear the reports: ${error.message}` };
  refresh(incidentId);
  return { ok: true };
}
