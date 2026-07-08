"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/server";
import { getCurrentAdmin } from "../_lib/admin";

export type BroadcastActionResult = { ok: true } | { error: string };

async function requireStaff(): Promise<{ error: string } | null> {
  const caller = await getCurrentAdmin();
  if (!caller || !["admin", "moderator"].includes(caller.role)) {
    return { error: "Admin or moderator privileges required." };
  }
  return null;
}

export async function deleteBroadcast(id: string): Promise<BroadcastActionResult> {
  if (!id) return { error: "No broadcast specified." };
  const gate = await requireStaff();
  if (gate) return gate;

  const supabase = createAdminClient();
  const { error } = await supabase.from("broadcasts").delete().eq("id", id);
  if (error) return { error: `Failed to delete broadcast: ${error.message}` };

  revalidatePath("/admin/broadcasts");
  return { ok: true };
}

/** End a broadcast now by setting its expiry to the current time. */
export async function expireBroadcast(id: string): Promise<BroadcastActionResult> {
  if (!id) return { error: "No broadcast specified." };
  const gate = await requireStaff();
  if (gate) return gate;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("broadcasts")
    .update({ expires_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: `Failed to end broadcast: ${error.message}` };

  revalidatePath("/admin/broadcasts");
  return { ok: true };
}

/** Archive a broadcast: hide it from the active list and the mobile feed. */
export async function archiveBroadcast(id: string): Promise<BroadcastActionResult> {
  if (!id) return { error: "No broadcast specified." };
  const gate = await requireStaff();
  if (gate) return gate;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("broadcasts")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: `Failed to archive broadcast: ${error.message}` };

  revalidatePath("/admin/broadcasts");
  return { ok: true };
}

/** Restore an archived broadcast back to the active list. */
export async function restoreBroadcast(id: string): Promise<BroadcastActionResult> {
  if (!id) return { error: "No broadcast specified." };
  const gate = await requireStaff();
  if (gate) return gate;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("broadcasts")
    .update({ archived_at: null })
    .eq("id", id);
  if (error) return { error: `Failed to restore broadcast: ${error.message}` };

  revalidatePath("/admin/broadcasts");
  return { ok: true };
}
