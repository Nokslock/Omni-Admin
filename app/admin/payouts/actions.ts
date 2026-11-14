"use server";

import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/app/lib/supabase/session";
import { getCurrentAdmin } from "../_lib/admin";
import { PAYOUT_ERRORS } from "../_lib/payouts";

export type PayoutResult = { ok: true } | { error: string };

/**
 * These go through the signed-in admin's own session, not the service role: the
 * database functions check who is calling, and do the bookkeeping (returning
 * coins on a rejection) in one transaction.
 */
async function call(fn: string, args: Record<string, string>): Promise<PayoutResult> {
  const admin = await getCurrentAdmin();
  if (admin?.role !== "admin") return { error: "Only admins can handle payouts." };

  const session = await createSessionClient();
  const { error } = await session.rpc(fn, args);
  if (error) {
    const known = Object.keys(PAYOUT_ERRORS).find((k) => error.message.includes(k));
    return { error: known ? PAYOUT_ERRORS[known] : `That didn't go through: ${error.message}` };
  }
  revalidatePath("/admin/payouts");
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/** Records that the bank transfer was sent. It does not send any money itself. */
export async function markPayoutPaid(id: string, reference: string): Promise<PayoutResult> {
  const ref = reference.trim();
  if (!id) return { error: "No request specified." };
  if (ref.length < 3) return { error: "Enter the bank transfer reference." };
  if (ref.length > 120) return { error: "That reference is too long." };
  return call("mark_withdrawal_paid", { p_id: id, p_reference: ref });
}

/** Rejects a request and returns the coins to the person's wallet. */
export async function rejectPayout(id: string, reason: string): Promise<PayoutResult> {
  const why = reason.trim();
  if (!id) return { error: "No request specified." };
  if (why.length < 3) return { error: "Add a reason so the person knows why." };
  if (why.length > 300) return { error: "Keep the reason under 300 characters." };
  return call("reject_withdrawal", { p_id: id, p_reason: why });
}

/** Confirms the bank account name was checked against the person. */
export async function verifyPayoutAccount(userId: string): Promise<PayoutResult> {
  if (!userId) return { error: "No account specified." };
  return call("verify_payout_account", { p_user_id: userId });
}
