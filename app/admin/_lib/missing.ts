// Client-safe types + meta for the missing-person feature.
// Server-only data fetching lives in missing.data.ts.

export type MissingStatus = "pending" | "approved" | "rejected" | "resolved";

export type MissingRequest = {
  id: string;
  submittedBy: string | null;
  submitterName: string | null;
  submitterEmail: string | null;
  title: string;
  message: string;
  imageUrl: string | null;
  contactInfo: string;
  lastSeenLat: number | null;
  lastSeenLng: number | null;
  lastSeenAt: string | null;
  lastSeenPlace: string | null;
  status: MissingStatus;
  adminNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  broadcastAt: string | null;
  createdAt: string;
  /** Where the request was reported from (ISO alpha-2). */
  originCountry: string | null;
  /** Audience targeting (ISO alpha-2 or 'ALL'). */
  audienceCountry: string;
};

export const missingStatusMeta: Record<
  MissingStatus,
  { label: string; color: string }
> = {
  pending: { label: "Pending", color: "#eab308" },
  approved: { label: "Approved", color: "#22c55e" },
  rejected: { label: "Rejected", color: "#ef4444" },
  resolved: { label: "Resolved", color: "#3b82f6" },
};
