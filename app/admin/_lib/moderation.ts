// Client-safe types for comment moderation. Data loading is in
// moderation.data.ts.

/** A comment is hidden from everyone once this many people report it. */
export const HIDE_AFTER_REPORTS = 3;

export type ModComment = {
  id: string;
  body: string;
  createdAt: string;
  incidentId: string;
  incidentTitle: string | null;
  author: {
    id: string;
    name: string;
    email: string | null;
    pro: boolean;
    suspended: boolean;
  } | null;
  /** How many people reported it (each person once). */
  reports: number;
  lastReportedAt: string | null;
  /** Names of who reported it, for context. */
  reporterNames: string[];
};

export function relTime(iso: string): string {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
