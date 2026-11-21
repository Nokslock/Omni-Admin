import "server-only";
import { createAdminClient } from "@/app/lib/supabase/server";
import type { GiftWindow, HoldDay, Payout, PayoutOverview, PayoutStatus } from "./payouts";

type Row = {
  id: string;
  user_id: string | null;
  coins: number;
  coin_value: number | string;
  currency: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: PayoutStatus;
  reference: string | null;
  reason: string | null;
  created_at: string;
  decided_at: string | null;
};

const DAY_MS = 86_400_000;

export async function getPayoutOverview(): Promise<PayoutOverview> {
  const supabase = createAdminClient();

  const [{ data: rows, error }, { data: settings }, { data: wallets }, { data: gifts }] = await Promise.all([
    supabase
      .from("token_withdrawals")
      .select(
        "id, user_id, coins, coin_value, currency, bank_name, account_number, account_name, status, reference, reason, created_at, decided_at",
      )
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("wallet_settings")
      .select("currency, coin_value, min_withdrawal, hold_days, gift_share_percent")
      .maybeSingle(),
    supabase.from("token_wallets").select("earned_balance").gt("earned_balance", 0),
    // Every member-to-member gift, from the sender's side: what they paid and
    // what Kasala kept. The reporter got the difference.
    supabase
      .from("token_ledger")
      .select("delta, platform_fee, created_at, gift_id")
      .eq("kind", "tip_sent")
      .order("created_at", { ascending: true })
      .limit(20000),
  ]);
  if (error) throw new Error(`Failed to load payouts: ${error.message}`);

  const list = (rows ?? []) as Row[];
  const holdDays = Number(settings?.hold_days ?? 14);

  const userIds = [...new Set(list.map((r) => r.user_id).filter((v): v is string => !!v))];
  const [{ data: users }, { data: accounts }, { data: held }] = await Promise.all([
    userIds.length
      ? supabase.from("users").select("id, name, email, phone, status").in("id", userIds)
      : Promise.resolve({ data: [] as { id: string; name: string; email: string | null; phone: string | null; status: string }[] }),
    userIds.length
      ? supabase.from("payout_accounts").select("user_id, account_number, verified_at").in("user_id", userIds)
      : Promise.resolve({ data: [] as { user_id: string; account_number: string; verified_at: string | null }[] }),
    // Tips still inside the hold period: these become cash-out-able day by day.
    supabase
      .from("token_ledger")
      .select("user_id, delta, created_at")
      .eq("kind", "tip_received")
      .gt("created_at", new Date(Date.now() - holdDays * DAY_MS).toISOString())
      .limit(5000),
  ]);

  const people = new Map((users ?? []).map((u) => [u.id, u]));
  const verified = new Set(
    (accounts ?? []).filter((a) => a.verified_at).map((a) => `${a.user_id}:${a.account_number}`),
  );

  const payouts: Payout[] = list.map((r) => {
    const u = r.user_id ? people.get(r.user_id) : undefined;
    const coinValue = Number(r.coin_value);
    return {
      id: r.id,
      userId: r.user_id,
      userName: u?.name ?? "Former member",
      userEmail: u?.email ?? null,
      userPhone: u?.phone ?? null,
      userSuspended: u?.status === "suspended",
      coins: r.coins,
      coinValue,
      amount: r.coins * coinValue,
      currency: r.currency,
      bankName: r.bank_name,
      accountNumber: r.account_number,
      accountName: r.account_name,
      accountVerified: !!r.user_id && verified.has(`${r.user_id}:${r.account_number}`),
      status: r.status,
      reference: r.reference,
      reason: r.reason,
      createdAt: r.created_at,
      decidedAt: r.decided_at,
    };
  });

  const byDay = new Map<string, { coins: number; people: Set<string> }>();
  for (const t of held ?? []) {
    const date = new Date(Date.parse(t.created_at as string) + holdDays * DAY_MS).toISOString().slice(0, 10);
    const d = byDay.get(date) ?? { coins: 0, people: new Set<string>() };
    d.coins += Number(t.delta);
    d.people.add(t.user_id as string);
    byDay.set(date, d);
  }
  const schedule: HoldDay[] = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({ date, coins: d.coins, people: d.people.size }));

  // Gift names and emoji, for the per-gift counts.
  const { data: giftTypes } = await supabase.from("gift_types").select("id, emoji, names");
  const giftInfo = new Map(
    (giftTypes ?? []).map((g) => [
      g.id as string,
      { emoji: g.emoji as string, name: ((g.names as Record<string, string>)?.en ?? g.id) as string },
    ]),
  );
  const counts = { last30: new Map<string, number>(), allTime: new Map<string, number>() };

  const emptyWindow = (): GiftWindow => ({ gifts: 0, sent: 0, toReporters: 0, kept: 0, byGift: [] });
  const last30 = emptyWindow();
  const allTime = emptyWindow();
  const since30 = Date.now() - 30 * DAY_MS;
  let cutSince: string | null = null;
  for (const g of gifts ?? []) {
    const sent = -Number(g.delta);
    const kept = Number(g.platform_fee ?? 0);
    if (kept > 0 && !cutSince) cutSince = g.created_at as string;
    const recent = Date.parse(g.created_at as string) >= since30;
    for (const w of recent ? [allTime, last30] : [allTime]) {
      w.gifts += 1;
      w.sent += sent;
      w.kept += kept;
      w.toReporters += sent - kept;
    }
    // Gifts sent before the gift list existed have no gift_id.
    const id = (g.gift_id as string | null) ?? null;
    if (id) {
      for (const m of recent ? [counts.allTime, counts.last30] : [counts.allTime]) {
        m.set(id, (m.get(id) ?? 0) + 1);
      }
    }
  }
  const toList = (m: Map<string, number>) =>
    [...m.entries()]
      .map(([id, count]) => ({ id, count, ...(giftInfo.get(id) ?? { emoji: "🎁", name: id }) }))
      .sort((a, b) => b.count - a.count);
  last30.byGift = toList(counts.last30);
  allTime.byGift = toList(counts.allTime);

  return {
    payouts,
    gifts: {
      sharePercent: Number(settings?.gift_share_percent ?? 60),
      last30,
      allTime,
      cutSince,
    },
    currency: settings?.currency ?? "NGN",
    coinValue: Number(settings?.coin_value ?? 0),
    minWithdrawal: Number(settings?.min_withdrawal ?? 0),
    holdDays,
    earnedOutstanding: (wallets ?? []).reduce((s, w) => s + Number(w.earned_balance), 0),
    schedule,
    loadedAtMs: Date.now(),
  };
}

/** Cash-out requests waiting to be paid, for the sidebar badge. */
export async function countPendingPayouts(): Promise<number> {
  const { count, error } = await createAdminClient()
    .from("token_withdrawals")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  if (error) return 0;
  return count ?? 0;
}
