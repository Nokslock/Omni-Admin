"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/server";
import { createSessionClient } from "@/app/lib/supabase/session";
import { isValidTarget } from "@/app/lib/countries";
import type { MissingStatus } from "../_lib/missing";

export type MissingActionResult = { ok: true } | { error: string };

const VALID: MissingStatus[] = ["pending", "approved", "rejected", "resolved"];

export async function setMissingStatus(
  id: string,
  status: string,
  adminNotes?: string,
): Promise<MissingActionResult> {
  if (!VALID.includes(status as MissingStatus)) {
    return { error: "Invalid status." };
  }

  // Identify the reviewing admin from the session.
  const session = await createSessionClient();
  const {
    data: { user },
  } = await session.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  const now = new Date().toISOString();
  const update: Record<string, string | null> = {
    status,
    reviewed_by: user.id,
    reviewed_at: now,
  };
  if (adminNotes !== undefined) {
    update.admin_notes = adminNotes.trim() || null;
  }
  if (status === "approved") {
    update.broadcast_at = now;
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("missing_person_requests")
    .update(update)
    .eq("id", id);

  if (error) return { error: `Failed to update request: ${error.message}` };

  revalidatePath("/admin/missing");
  return { ok: true };
}

export async function setMissingAudience(
  id: string,
  country: string,
): Promise<MissingActionResult> {
  if (!isValidTarget(country)) {
    return { error: "Invalid country code." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("missing_person_requests")
    .update({ audience_country: country })
    .eq("id", id);

  if (error) return { error: `Failed to update audience: ${error.message}` };

  revalidatePath("/admin/missing");
  return { ok: true };
}
