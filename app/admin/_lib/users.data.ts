import "server-only";
import { createAdminClient } from "@/app/lib/supabase/server";
import type { User, UserRole, UserStatus } from "./users";

type UserRow = {
  id: string;
  name: string;
  email: string;
  avatar_color: string;
  joined_date: string;
  status: UserStatus;
  role: UserRole;
};

/**
 * Reliability is derived from how the community reacts to a reporter's
 * incidents: confirmations raise it, false-flags lower it.
 *
 * We smooth the raw ratio toward a neutral baseline so a reporter with one or
 * two pieces of feedback isn't slammed to 0% or vaulted to 100% on thin
 * evidence (Laplace / additive smoothing). With no feedback at all a reporter
 * sits at the baseline — "unrated", not "perfect".
 *
 *   score = (confirms + SMOOTHING * BASELINE) / (confirms + flags + SMOOTHING)
 */
const RELIABILITY_BASELINE = 0.7; // neutral prior → 70%
const RELIABILITY_SMOOTHING = 4; // weight of that prior, in "virtual" votes

export function computeReliability(confirms: number, flags: number): number {
  const score =
    (confirms + RELIABILITY_SMOOTHING * RELIABILITY_BASELINE) /
    (confirms + flags + RELIABILITY_SMOOTHING);
  return Math.round(score * 100);
}

function formatJoined(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = String(d.getFullYear()).slice(-2);
  return `${day} ${month} ${year}`;
}

type Tally = { reports: number; confirms: number; flags: number };

export async function getUsers(): Promise<User[]> {
  const supabase = createAdminClient();

  const [usersRes, incidentsRes, feedbackRes] = await Promise.all([
    supabase
      .from("users")
      .select("id, name, email, avatar_color, joined_date, status, role"),
    supabase.from("incidents").select("id, reporter_id"),
    supabase.from("incident_feedback").select("incident_id, kind"),
  ]);

  if (usersRes.error) {
    throw new Error(`Failed to load users: ${usersRes.error.message}`);
  }

  const userRows = (usersRes.data as UserRow[]) ?? [];
  const incidents = (incidentsRes.data as { id: string; reporter_id: string | null }[]) ?? [];
  const feedback = (feedbackRes.data as { incident_id: string; kind: string }[]) ?? [];

  // incident id → the user who reported it
  const reporterOf = new Map<string, string>();
  // reporterId → running tally of reports / confirms / flags
  const tally = new Map<string, Tally>();

  const bump = (userId: string): Tally => {
    let t = tally.get(userId);
    if (!t) {
      t = { reports: 0, confirms: 0, flags: 0 };
      tally.set(userId, t);
    }
    return t;
  };

  for (const inc of incidents) {
    if (!inc.reporter_id) continue;
    reporterOf.set(inc.id, inc.reporter_id);
    bump(inc.reporter_id).reports += 1;
  }

  for (const f of feedback) {
    const reporterId = reporterOf.get(f.incident_id);
    if (!reporterId) continue; // feedback on an incident with no known reporter
    const t = bump(reporterId);
    if (f.kind === "confirm") t.confirms += 1;
    else if (f.kind === "flag") t.flags += 1;
  }

  const users = userRows.map((row): User => {
    const t = tally.get(row.id) ?? { reports: 0, confirms: 0, flags: 0 };
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      avatarColor: row.avatar_color,
      joined: formatJoined(row.joined_date),
      joinedDate: row.joined_date,
      reports: t.reports,
      reliability: computeReliability(t.confirms, t.flags),
      status: row.status,
      role: row.role,
    };
  });

  // Most active reporters first (matches the previous default ordering).
  users.sort((a, b) => b.reports - a.reports);
  return users;
}
