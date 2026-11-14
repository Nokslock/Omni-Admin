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
  /** A missing person, or a general community notice. */
  requestType: "missing" | "notice";
  age: number | null;
  sex: "female" | "male" | null;
  clothing: string | null;
  /**
   * The submitter chose "hide my number": the public contact is blank and the
   * real number is in privatePhone, which only staff see.
   */
  contactHidden: boolean;
  privatePhone: string | null;
  /** "I've seen them" reports from the public, newest first. */
  sightings: Sighting[];
};

export type Sighting = {
  id: string;
  note: string | null;
  lat: number | null;
  lng: number | null;
  createdAt: string;
  byName: string | null;
  byEmail: string | null;
  byPhone: string | null;
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
