import "server-only";
import { createAdminClient } from "@/app/lib/supabase/server";

type UserRow = {
  id: string;
  name: string;
  email: string | null;
  referral_code: string | null;
  referred_by: string | null;
  referred_at: string | null;
  created_at: string;
  status: string | null;
  verified: boolean | null;
};

export type ReferredUser = {
  id: string;
  name: string;
  email: string | null;
  joinedAt: string;
  pro: boolean;
  /** Has sent at least one incident report. */
  reports: number;
  suspended: boolean;
  referrerId: string;
  referrerName: string;
};

export type Referrer = {
  id: string;
  name: string;
  email: string | null;
  code: string | null;
  pro: boolean;
  total: number;
  last30: number;
  /** Referred people who have sent at least one report. */
  active: number;
  /** Referred people who have Kasala Pro. */
  proReferred: number;
  lastAt: string;
};

export type ReferralOverview = {
  totalUsers: number;
  totalReferred: number;
  last7: number;
  last30: number;
  /** Share of last-30-day sign-ups that came from a referral (0–1). */
  share30: number;
  signups30: number;
  referrers: Referrer[];
  recent: ReferredUser[];
  /** Referred sign-ups per week, oldest first (12 weeks, this week last). */
  weekly: { weekStart: string; count: number }[];
  activeRate: number;
  proRate: number;
  /** Referral coins paid out: 1 per sign-up, 1 per paid Pro month. */
  coins: { signup: number; proMonth: number; last30: number; payingNow: number };
};

const DAY = 86_400_000;
const SELECT =
  "id, name, email, referral_code, referred_by, referred_at, created_at, status, verified";

export async function getReferralOverview(): Promise<ReferralOverview> {
  const supabase = createAdminClient();
  const since30 = new Date(Date.now() - 30 * DAY).toISOString();

  const [{ data: referredRows }, { count: totalUsers }, { count: signups30 }, { data: rewardRows }] =
    await Promise.all([
      supabase
        .from("users")
        .select(SELECT)
        .not("referred_by", "is", null)
        .order("referred_at", { ascending: false, nullsFirst: false }),
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since30),
      supabase.from("referral_rewards").select("referred_id, kind, coins, created_at").limit(50000),
    ]);
  const referred = (referredRows ?? []) as UserRow[];

  const referrerIds = [...new Set(referred.map((r) => r.referred_by!))];
  const referredIds = referred.map((r) => r.id);
  const [{ data: referrerRows }, { data: reportRows }] = await Promise.all([
    referrerIds.length
      ? supabase.from("users").select(SELECT).in("id", referrerIds)
      : Promise.resolve({ data: [] }),
    referredIds.length
      ? supabase.from("incidents").select("reporter_id").in("reporter_id", referredIds)
      : Promise.resolve({ data: [] }),
  ]);
  const referrerById = new Map(
    ((referrerRows ?? []) as UserRow[]).map((u) => [u.id, u]),
  );
  const reportsBy = new Map<string, number>();
  for (const r of (reportRows ?? []) as { reporter_id: string }[]) {
    reportsBy.set(r.reporter_id, (reportsBy.get(r.reporter_id) ?? 0) + 1);
  }

  const joined = (u: UserRow) => u.referred_at ?? u.created_at;
  const now = Date.now();
  const within = (iso: string, days: number) => now - Date.parse(iso) <= days * DAY;

  const recent: ReferredUser[] = referred.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    joinedAt: joined(u),
    pro: u.verified === true,
    reports: reportsBy.get(u.id) ?? 0,
    suspended: u.status === "suspended",
    referrerId: u.referred_by!,
    referrerName: referrerById.get(u.referred_by!)?.name ?? "Deleted account",
  }));

  const groups = new Map<string, ReferredUser[]>();
  for (const r of recent) {
    const list = groups.get(r.referrerId) ?? [];
    list.push(r);
    groups.set(r.referrerId, list);
  }
  const referrers: Referrer[] = [...groups.entries()]
    .map(([id, list]) => {
      const u = referrerById.get(id);
      return {
        id,
        name: u?.name ?? "Deleted account",
        email: u?.email ?? null,
        code: u?.referral_code ?? null,
        pro: u?.verified === true,
        total: list.length,
        last30: list.filter((l) => within(l.joinedAt, 30)).length,
        active: list.filter((l) => l.reports > 0).length,
        proReferred: list.filter((l) => l.pro).length,
        lastAt: list.reduce((a, l) => (l.joinedAt > a ? l.joinedAt : a), ""),
      };
    })
    .sort((a, b) => b.total - a.total || b.lastAt.localeCompare(a.lastAt));

  // 12 weekly buckets, weeks starting Monday (UTC).
  const today = new Date();
  const monday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  const weekly = Array.from({ length: 12 }, (_, i) => {
    const start = new Date(monday.getTime() - (11 - i) * 7 * DAY);
    const end = start.getTime() + 7 * DAY;
    return {
      weekStart: start.toISOString(),
      count: recent.filter((r) => {
        const t = Date.parse(r.joinedAt);
        return t >= start.getTime() && t < end;
      }).length,
    };
  });

  const last30 = recent.filter((r) => within(r.joinedAt, 30)).length;
  const total = recent.length;
  const coins = { signup: 0, proMonth: 0, last30: 0, payingNow: 0 };
  const paying = new Set<string>();
  for (const r of rewardRows ?? []) {
    const n = Number(r.coins);
    if (r.kind === "signup") coins.signup += n;
    else coins.proMonth += n;
    if (within(r.created_at as string, 30)) coins.last30 += n;
    // A monthly coin in the last ~month means they're still on paid Pro.
    if (r.kind === "pro_month" && within(r.created_at as string, 31)) paying.add(r.referred_id as string);
  }
  coins.payingNow = paying.size;

  return {
    coins,
    totalUsers: totalUsers ?? 0,
    totalReferred: total,
    last7: recent.filter((r) => within(r.joinedAt, 7)).length,
    last30,
    signups30: signups30 ?? 0,
    share30: signups30 ? last30 / signups30 : 0,
    referrers,
    recent: recent.slice(0, 50),
    weekly,
    activeRate: total ? recent.filter((r) => r.reports > 0).length / total : 0,
    proRate: total ? recent.filter((r) => r.pro).length / total : 0,
  };
}
