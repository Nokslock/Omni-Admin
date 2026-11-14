import "server-only";
import { createAdminClient } from "@/app/lib/supabase/server";
import { getPendingDeletionCount } from "./deletion-requests.data";
import { countReportedComments } from "./moderation.data";
import { countPendingAds } from "./ads.data";
import { countPendingPayouts } from "./payouts.data";

export type NavCounts = {
  unverified: number;
  deletions: number;
  /** Comments with at least one report, waiting for a decision. */
  reportedComments: number;
  /** Ad requests waiting for approval. */
  pendingAds: number;
  /** Cash-out requests waiting to be paid. */
  pendingPayouts: number;
};

async function countUnverifiedIncidents(): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("incidents")
    .select("id", { count: "exact", head: true })
    .eq("status", "unverified");
  if (error) return 0;
  return count ?? 0;
}

/** Badge counts shown beside sidebar links. Cheap head-only queries. */
export async function getNavCounts(): Promise<NavCounts> {
  const [unverified, deletions, reportedComments, pendingAds, pendingPayouts] = await Promise.all([
    countUnverifiedIncidents(),
    getPendingDeletionCount(),
    countReportedComments(),
    countPendingAds(),
    countPendingPayouts(),
  ]);
  return { unverified, deletions, reportedComments, pendingAds, pendingPayouts };
}
