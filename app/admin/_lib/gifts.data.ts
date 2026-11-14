import "server-only";
import { createAdminClient } from "@/app/lib/supabase/server";
import type { GrantRow, Recipient } from "./gifts";

export async function getRecipient(userId: string): Promise<Recipient | null> {
  const supabase = createAdminClient();
  const [{ data: u }, { data: w }, { data: p }] = await Promise.all([
    supabase
      .from("users")
      .select("id, name, email, phone, status, deletion_scheduled_for")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("token_wallets")
      .select("balance, bought_balance, earned_balance")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("pro_subscriptions")
      .select("expires_at, store, will_renew")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);
  if (!u) return null;
  const active = p && Date.parse(p.expires_at) > Date.now();
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    suspended: u.status === "suspended",
    deleting: u.deletion_scheduled_for != null,
    coins: {
      total: Number(w?.balance ?? 0),
      bought: Number(w?.bought_balance ?? 0),
      earned: Number(w?.earned_balance ?? 0),
    },
    pro: active ? { until: p.expires_at, store: p.store, willRenew: p.will_renew } : null,
  };
}

type Row = {
  id: string;
  kind: GrantRow["kind"];
  coins: number | null;
  pro_days: number | null;
  pro_until: string | null;
  note: string | null;
  created_at: string;
  user_id: string | null;
  granted_by: string | null;
};

export async function getGrantHistory(userId?: string, limit = 100): Promise<GrantRow[]> {
  const supabase = createAdminClient();
  let q = supabase
    .from("staff_grants")
    .select("id, kind, coins, pro_days, pro_until, note, created_at, user_id, granted_by")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (userId) q = q.eq("user_id", userId);
  const { data } = await q;
  const rows = (data ?? []) as Row[];
  const ids = [
    ...new Set(rows.flatMap((r) => [r.user_id, r.granted_by]).filter((v): v is string => !!v)),
  ];
  const names = new Map<string, string>();
  if (ids.length) {
    const { data: users } = await supabase.from("users").select("id, name").in("id", ids);
    for (const u of users ?? []) names.set(u.id, u.name);
  }
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    coins: r.coins,
    proDays: r.pro_days,
    proUntil: r.pro_until,
    note: r.note,
    createdAt: r.created_at,
    userId: r.user_id,
    userName: (r.user_id && names.get(r.user_id)) || "Deleted account",
    byName: (r.granted_by && names.get(r.granted_by)) || "—",
  }));
}

/** This month's totals, for the header. */
export async function getGiftTotals() {
  const supabase = createAdminClient();
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const [{ data: month }, { count: giftedPro }] = await Promise.all([
    supabase
      .from("staff_grants")
      .select("kind, coins")
      .gte("created_at", start.toISOString()),
    supabase
      .from("pro_subscriptions")
      .select("user_id", { count: "exact", head: true })
      .eq("store", "kasala")
      .gt("expires_at", new Date().toISOString()),
  ]);
  const rows = (month ?? []) as { kind: string; coins: number | null }[];
  return {
    coinsThisMonth: rows.reduce((a, r) => a + (r.kind === "coins" ? (r.coins ?? 0) : 0), 0),
    proGiftsThisMonth: rows.filter((r) => r.kind === "pro").length,
    giftedProActive: giftedPro ?? 0,
  };
}
