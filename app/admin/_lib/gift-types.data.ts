import "server-only";
import { createAdminClient } from "@/app/lib/supabase/server";
import type { GiftTypeRow } from "./gift-types";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Every gift, hidden ones included, in app order, with how often each was sent. */
export async function getGiftTypes(): Promise<{ gifts: GiftTypeRow[]; sharePercent: number }> {
  const supabase = createAdminClient();
  const [{ data: rows, error }, { data: sent }, { data: settings }] = await Promise.all([
    supabase
      .from("gift_types")
      .select("id, emoji, image_url, names, coins, sort, active")
      .order("sort")
      .order("coins"),
    supabase
      .from("token_ledger")
      .select("gift_id, created_at")
      .eq("kind", "tip_sent")
      .not("gift_id", "is", null)
      .limit(50000),
    supabase.from("wallet_settings").select("gift_share_percent").maybeSingle(),
  ]);
  if (error) throw new Error(`Failed to load gifts: ${error.message}`);

  const since30 = Date.now() - 30 * DAY_MS;
  const all = new Map<string, number>();
  const recent = new Map<string, number>();
  for (const s of sent ?? []) {
    const id = s.gift_id as string;
    all.set(id, (all.get(id) ?? 0) + 1);
    if (Date.parse(s.created_at as string) >= since30) recent.set(id, (recent.get(id) ?? 0) + 1);
  }

  return {
    sharePercent: Number(settings?.gift_share_percent ?? 60),
    gifts: (rows ?? []).map((r) => ({
      id: r.id as string,
      emoji: r.emoji as string,
      imageUrl: (r.image_url as string | null) ?? null,
      names: (r.names ?? {}) as GiftTypeRow["names"],
      coins: Number(r.coins),
      sort: Number(r.sort),
      active: r.active === true,
      sentAllTime: all.get(r.id as string) ?? 0,
      sentLast30: recent.get(r.id as string) ?? 0,
    })),
  };
}
