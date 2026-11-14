// pending      submitted, not acted on yet
// in_progress  account deactivated; erased automatically when the 30 days end
// completed    account erased (set by the database when the purge runs)
// rejected     turned down by an operator
// cancelled    the person restored their account within the 30 days
export type DeletionStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "rejected"
  | "cancelled";

export type DeletionRequest = {
  id: string;
  email: string;
  phone: string | null;
  reason: string | null;
  /** Matched user from public.users, or null if no match. */
  userId: string | null;
  userName: string | null;
  userJoined: string | null;
  userReports: number | null;
  /** When the matched account was deactivated, if it has been. */
  deactivatedAt: string | null;
  /** When the purge will erase it (30 days after deactivation). */
  erasesAt: string | null;
  status: DeletionStatus;
  adminNote: string | null;
  reviewedBy: string | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  completedAt: string | null;
  /** Human-readable "3m ago" */
  createdAgo: string;
  createdAt: string;
};

export const deletionStatusMeta: Record<
  DeletionStatus,
  { label: string; color: string }
> = {
  pending: { label: "Pending", color: "#f59e0b" },
  in_progress: { label: "Deactivated", color: "#3b82f6" },
  completed: { label: "Erased", color: "#22c55e" },
  rejected: { label: "Rejected", color: "#94a3b8" },
  cancelled: { label: "Restored", color: "#a855f7" },
};

/** An account waiting out its 30 days, whether from the app or this panel. */
export type ScheduledDeletion = {
  userId: string;
  name: string;
  email: string | null;
  deactivatedAt: string;
  erasesAt: string;
  /** True when a request on this page covers it. */
  hasRequest: boolean;
};

/** "in 12 days", "today", or "overdue" for an erase date. */
export function untilErase(iso: string): string {
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  return days === 1 ? "in 1 day" : `in ${days} days`;
}

export function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "just now";
  const m = Math.floor(ms / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  return `${mo}mo ago`;
}
