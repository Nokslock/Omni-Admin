export type BroadcastSeverity = "info" | "warning" | "critical";
export type BroadcastAudience = "all" | "admins" | "users";

export type Broadcast = {
  id: string;
  title: string;
  body: string;
  severity: BroadcastSeverity;
  audience: BroadcastAudience;
  country: string; // ISO alpha-2, or "ALL"
  sentByName: string | null;
  createdAt: string; // ISO
  createdAgo: string; // "3h ago"
  expiresAt: string | null; // ISO, or null = never
  isExpired: boolean;
  archivedAt: string | null; // ISO, or null = active
  isArchived: boolean;
};

export const severityMeta: Record<
  BroadcastSeverity,
  { label: string; color: string }
> = {
  info: { label: "Info", color: "#60a5fa" },
  warning: { label: "Warning", color: "#fbbf24" },
  critical: { label: "Critical", color: "#f87171" },
};

export const audienceMeta: Record<BroadcastAudience, { label: string }> = {
  all: { label: "Everyone" },
  users: { label: "Users only" },
  admins: { label: "Admins only" },
};

export function relativeTime(iso: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

/** Human "expires in / expired" label. Returns null when there's no expiry. */
export function expiryLabel(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return "Expired";
  const min = Math.floor(diffMs / 60000);
  if (min < 60) return `Expires in ${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `Expires in ${hr}h`;
  return `Expires in ${Math.floor(hr / 24)}d`;
}
