export type UserStatus = "clear" | "investigation" | "suspended";

export type UserRole = "admin" | "user";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
  verified: boolean;
  avatarColor: string;
  joined: string; // formatted "12 Aug 24"
  joinedDate: string; // ISO "2024-08-12"
  reports: number;
  reliability: number; // 0–100
  status: UserStatus;
  role: UserRole;
};

export const userStatusMeta: Record<
  UserStatus,
  { label: string; color: string; actionLabel: "Suspend" | "Reinstate" }
> = {
  clear: { label: "Resolved", color: "#22c55e", actionLabel: "Suspend" },
  investigation: { label: "Under Investigation", color: "#f59e0b", actionLabel: "Suspend" },
  suspended: { label: "Suspended", color: "#ef4444", actionLabel: "Reinstate" },
};

export const roleMeta: Record<UserRole, { label: string; color: string }> = {
  admin: { label: "Admin", color: "#6366f1" },
  user: { label: "User", color: "#64748b" },
};

export function reliabilityColor(r: number): string {
  if (r >= 80) return "#22c55e";
  if (r >= 60) return "#eab308";
  return "#ef4444";
}
