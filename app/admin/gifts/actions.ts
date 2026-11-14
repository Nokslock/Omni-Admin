"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/server";
import { createSessionClient } from "@/app/lib/supabase/session";
import { getCurrentAdmin } from "../_lib/admin";
import { GIFT_ERRORS, type UserHit } from "../_lib/gifts";

export type GiftResult = { ok: true; message: string } | { error: string };

/** Finds people by name, email or phone for the recipient picker. */
export async function searchUsers(query: string): Promise<UserHit[]> {
  const admin = await getCurrentAdmin();
  if (!admin || !["admin", "moderator"].includes(admin.role)) return [];
  // Keep the search term out of PostgREST's filter syntax.
  const q = query.trim().replace(/[%,()*\\]/g, " ").trim();
  if (q.length < 2) return [];
  const { data } = await createAdminClient()
    .from("users")
    .select("id, name, email, verified")
    .or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
    .order("name")
    .limit(8);
  return (data ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    pro: u.verified === true,
  }));
}

type Gift =
  | { kind: "coins"; userId: string; coins: number; note: string }
  | { kind: "pro"; userId: string; days: number; note: string }
  | { kind: "end_pro"; userId: string; note: string };

/** Runs a gift through the staff-gift Edge Function (admin only, sends the push). */
export async function sendGift(gift: Gift): Promise<GiftResult> {
  const admin = await getCurrentAdmin();
  if (admin?.role !== "admin") return { error: GIFT_ERRORS.admins_only };

  const session = await createSessionClient();
  const {
    data: { session: current },
  } = await session.auth.getSession();
  if (!current?.access_token) return { error: "You're not signed in." };

  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/staff-gift`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${current.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: gift.userId,
      kind: gift.kind,
      coins: gift.kind === "coins" ? gift.coins : undefined,
      days: gift.kind === "pro" ? gift.days : undefined,
      note: gift.note.trim() || null,
    }),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    notified?: number;
    pro_until?: string;
  };
  if (!res.ok) {
    return { error: GIFT_ERRORS[body.error ?? ""] ?? body.error ?? "The gift didn't go through." };
  }

  revalidatePath("/admin/gifts");
  revalidatePath("/admin/users");
  const told = body.notified
    ? "They've been sent a notification."
    : "They have no device signed in, so no notification was sent.";
  if (gift.kind === "coins") return { ok: true, message: `${gift.coins} coins sent. ${told}` };
  if (gift.kind === "pro") {
    const until = body.pro_until ? new Date(body.pro_until).toLocaleDateString() : "";
    return { ok: true, message: `Pro given until ${until}. ${told}` };
  }
  return { ok: true, message: "Gifted Pro ended." };
}
