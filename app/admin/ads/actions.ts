"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/server";
import { createSessionClient } from "@/app/lib/supabase/session";
import { getCurrentAdmin } from "../_lib/admin";
import type { AdStatus } from "../_lib/ads";

export type AdActionResult = { ok: true } | { error: string };

const VALID: AdStatus[] = ["pending", "approved", "rejected", "paused"];

/**
 * Approve, reject, pause or resume an ad. Rejections need a reason, which is
 * shown back to the person who submitted it.
 */
export async function setAdStatus(
  id: string,
  status: string,
  notes?: string,
): Promise<AdActionResult> {
  if (!id) return { error: "No ad specified." };
  if (!VALID.includes(status as AdStatus)) return { error: "Invalid status." };
  const reason = notes?.trim() ?? "";
  if (status === "rejected" && !reason) return { error: "Add a reason so the advertiser knows what to fix." };

  const caller = await getCurrentAdmin();
  if (!caller || !["admin", "moderator"].includes(caller.role)) {
    return { error: "Admin or moderator privileges required." };
  }
  const session = await createSessionClient();
  const {
    data: { user },
  } = await session.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  const update: Record<string, string | null> = {
    status,
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
  };
  if (status === "rejected") update.admin_notes = reason;
  else if (status === "approved") update.admin_notes = null;

  const supabase = createAdminClient();
  const { error } = await supabase.from("ads").update(update).eq("id", id);
  if (error) return { error: `Failed to update ad: ${error.message}` };

  revalidatePath("/admin/ads");
  return { ok: true };
}

/** Change an ad's run window before or after approving it. */
export async function setAdSchedule(
  id: string,
  startsAt: string | null,
  endsAt: string | null,
): Promise<AdActionResult> {
  if (!id) return { error: "No ad specified." };
  const start = startsAt ? new Date(startsAt) : null;
  const end = endsAt ? new Date(endsAt) : null;
  if ((start && isNaN(start.getTime())) || (end && isNaN(end.getTime()))) return { error: "Invalid date." };
  if (start && end && end <= start) return { error: "The end date must be after the start date." };

  const caller = await getCurrentAdmin();
  if (!caller || !["admin", "moderator"].includes(caller.role)) {
    return { error: "Admin or moderator privileges required." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("ads")
    .update({ starts_at: start?.toISOString() ?? null, ends_at: end?.toISOString() ?? null })
    .eq("id", id);
  if (error) return { error: `Failed to update dates: ${error.message}` };

  revalidatePath("/admin/ads");
  return { ok: true };
}
