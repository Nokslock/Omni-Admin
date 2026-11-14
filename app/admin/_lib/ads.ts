export type AdStatus = "pending" | "approved" | "rejected" | "paused";

/**
 * card: logo, headline, description and button, laid out by the app.
 * banner: one 2:1 image the business designed, and a link.
 */
export type AdFormat = "card" | "banner";

export const adFormatLabel: Record<AdFormat, string> = {
  card: "Sponsored card",
  banner: "Banner",
};

export type Ad = {
  id: string;
  format: AdFormat;
  businessName: string;
  logoUrl: string | null;
  /** The banner image (2:1). Only for banners. */
  bannerUrl: string | null;
  /** Null for banners. */
  headline: string | null;
  body: string | null;
  linkUrl: string | null;
  ctaLabel: string;
  contactPhone: string | null;
  contactEmail: string | null;
  /** ISO alpha-2, or "ALL". */
  country: string;
  startsAt: string | null;
  endsAt: string | null;
  status: AdStatus;
  adminNotes: string | null;
  reviewedAt: string | null;
  reviewerName: string | null;
  createdAt: string;
  submitterName: string | null;
  submitterEmail: string | null;
};

export const adStatusMeta: Record<AdStatus, { label: string; color: string }> = {
  pending: { label: "Pending review", color: "#f59e0b" },
  approved: { label: "Approved", color: "#22c55e" },
  rejected: { label: "Rejected", color: "#ef4444" },
  paused: { label: "Paused", color: "#94a3b8" },
};

/** Where an approved ad sits relative to its run window. */
export function adRunState(ad: Pick<Ad, "status" | "startsAt" | "endsAt">, nowMs: number): "live" | "scheduled" | "ended" | null {
  if (ad.status !== "approved") return null;
  if (ad.endsAt && new Date(ad.endsAt).getTime() <= nowMs) return "ended";
  if (ad.startsAt && new Date(ad.startsAt).getTime() > nowMs) return "scheduled";
  return "live";
}
