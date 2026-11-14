"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/server";
import { createSessionClient } from "@/app/lib/supabase/session";

export type ActionResult = { ok: true } | { error: string };

type Staff = { id: string };

/** The signed-in operator, or an error when they aren't admin/moderator. */
async function requireStaff(): Promise<Staff | { error: string }> {
  const session = await createSessionClient();
  const {
    data: { user },
  } = await session.auth.getUser();
  if (!user) return { error: "You're not signed in." };
  const { data: row } = await createAdminClient()
    .from("users")
    .select("id, role")
    .eq("auth_id", user.id)
    .maybeSingle();
  if (!row || !["admin", "moderator"].includes(row.role)) {
    return { error: "Admin or moderator privileges required." };
  }
  return { id: row.id };
}

function reviewed(staff: Staff, note?: string) {
  const patch: Record<string, string | null> = {
    reviewed_by: staff.id,
    reviewed_at: new Date().toISOString(),
  };
  if (note !== undefined) patch.admin_note = note.trim() || null;
  return patch;
}

/**
 * Deactivates the requester's account, exactly as "Delete account" in the
 * app does: 30 days to change their mind, then the nightly purge archives a
 * limited legal record and erases the rest. Nothing is erased here.
 */
export async function deactivateForRequest(
  requestId: string,
  note?: string,
): Promise<ActionResult> {
  const staff = await requireStaff();
  if ("error" in staff) return staff;
  const supabase = createAdminClient();

  const { data: req } = await supabase
    .from("account_deletion_requests")
    .select("id, user_id, email")
    .eq("id", requestId)
    .maybeSingle();
  if (!req) return { error: "Request not found." };

  let userId = req.user_id as string | null;
  if (!userId) {
    const { data: match } = await supabase
      .from("users")
      .select("id")
      // Exact match only: this deactivates an account. The form stores
      // emails lower-cased.
      .eq("email", String(req.email).toLowerCase())
      .maybeSingle();
    userId = match?.id ?? null;
  }
  if (!userId) {
    return {
      error:
        "No account uses this email. Check it with the person, or close the request.",
    };
  }

  const { error: rpcErr } = await supabase.rpc("deactivate_account", {
    p_user_id: userId,
  });
  if (rpcErr) {
    console.error("deactivate_account failed:", rpcErr);
    return { error: "Couldn't deactivate the account." };
  }

  // The database also moves the request to in_progress; this records who did
  // it and links the account if it wasn't linked at submission.
  const { error } = await supabase
    .from("account_deletion_requests")
    .update({ ...reviewed(staff, note), user_id: userId, status: "in_progress" })
    .eq("id", requestId);
  if (error) console.error("deletion request update failed:", error);

  revalidatePath("/admin/deletion-requests");
  return { ok: true };
}

/**
 * Brings back a deactivated account during its 30 days (for someone who
 * changed their mind by email). Any open request is marked "restored" by the
 * database.
 */
export async function restoreAccount(
  userId: string,
  note?: string,
  requestId?: string,
): Promise<ActionResult> {
  const staff = await requireStaff();
  if ("error" in staff) return staff;
  const supabase = createAdminClient();

  const { data: restored, error } = await supabase.rpc("restore_account", {
    p_user_id: userId,
  });
  if (error) {
    console.error("restore_account failed:", error);
    return { error: "Couldn't restore the account." };
  }
  if (!restored) {
    return { error: "This account isn't deactivated, or its 30 days are over." };
  }
  if (requestId) {
    await supabase
      .from("account_deletion_requests")
      .update(reviewed(staff, note))
      .eq("id", requestId);
  }

  revalidatePath("/admin/deletion-requests");
  return { ok: true };
}

/**
 * Status changes that don't touch the account: reject, reopen, or close a
 * request no account matches. Erasing is never done by hand; the purge does
 * it when the 30 days end.
 */
export async function setDeletionStatus(
  id: string,
  status: "pending" | "rejected" | "completed",
  note?: string,
): Promise<ActionResult> {
  if (!["pending", "rejected", "completed"].includes(status)) {
    return { error: "Invalid status." };
  }
  const staff = await requireStaff();
  if ("error" in staff) return staff;
  const supabase = createAdminClient();

  if (status === "completed") {
    const { data: req } = await supabase
      .from("account_deletion_requests")
      .select("user_id, email")
      .eq("id", id)
      .maybeSingle();
    if (!req) return { error: "Request not found." };
    const lookup = supabase.from("users").select("id");
    const { data: match } = await (req.user_id
      ? lookup.eq("id", req.user_id)
      : lookup.eq("email", String(req.email).toLowerCase())
    ).maybeSingle();
    if (match) {
      return {
        error:
          "An account still matches this request. Deactivate it instead; it's erased automatically after 30 days.",
      };
    }
  }

  const patch: Record<string, string | null> = { ...reviewed(staff, note), status };
  if (status === "completed") patch.completed_at = new Date().toISOString();
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

/**
 * Erases an account immediately instead of waiting out the 30 days. Admins
 * only. Runs the same steps as the nightly purge (through its Edge Function,
 * authenticated with this admin's own login), so the 12-month legal record is
 * still written before anything is erased.
 */
export async function eraseNow(userId: string): Promise<ActionResult> {
  const session = await createSessionClient();
  const {
    data: { session: current },
  } = await session.auth.getSession();
  const staff = await requireStaff();
  if ("error" in staff) return staff;
  if (!current?.access_token) return { error: "You're not signed in." };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const res = await fetch(`${url}/functions/v1/purge-deleted-accounts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${current.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId }),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) return { error: body.error ?? "Couldn't erase the account." };

  revalidatePath("/admin/deletion-requests");
  revalidatePath("/admin/users");
  return { ok: true };
}
