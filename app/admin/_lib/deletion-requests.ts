export type DeletionStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "rejected";

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
  in_progress: { label: "In progress", color: "#3b82f6" },
  completed: { label: "Completed", color: "#22c55e" },
  rejected: { label: "Rejected", color: "#94a3b8" },
};

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
