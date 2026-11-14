export type IncidentType =
  | "fire"
  | "armed"
  | "crash"
  | "medical"
  | "flood"
  | "traffic"
  | "other"
  | "hoodlums"
  | "protest"
  | "kidnapping"
  | "armed_robbery"
  | "bandit"
  | "cultist"
  | "collapse"
  | "boat_accident";

export type IncidentStatus =
  | "active"
  | "unverified"
  | "resolved"
  | "false_alarm";

export type Severity = "critical" | "high" | "medium" | "low" | "info" | "resolved";

export type Incident = {
  id: string;
  type: IncidentType;
  typeLabel: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: Severity;
  reporter: string;
  reporterId: string | null;
  reporterPhone: string;
  /** The reporter has Kasala Pro (gold badge). */
  reporterPro: boolean;
  reportedAt: string; // human-readable "3m ago"
  reportedDate: string; // "2025-11-27"
  /** Exact report time (ISO 8601), for time windows and distance/time matching. */
  reportedAtIso: string;
  location: string;
  address: string;
  coords: { lat: number; lng: number };
  /** Position on our SVG map (0–2000 x, 0–1200 y) */
  mapXY: { x: number; y: number };
  /** Verified on arrival because the reporter has Kasala Pro and vouched. */
  proVerified: boolean;
  /** The reporter ticked "I confirm this is happening in my area right now". */
  attested: boolean;
  /** The reporter's own words (Kasala Pro). */
  note: string | null;
  /** Photo taken with the report (public URL in the incident-photos bucket). */
  photoUrl: string | null;
};

/** Confirmations that verify a report (matches the app and the database). */
export const CONFIRM_THRESHOLD = 3;

/** How a report came to be verified, for display. */
export function verificationSource(
  inc: Pick<Incident, "status" | "proVerified">,
  confirmations: number,
): string {
  if (inc.status === "unverified") {
    return `Not verified yet · ${confirmations} of ${CONFIRM_THRESHOLD} confirmations`;
  }
  if (confirmations >= CONFIRM_THRESHOLD) {
    return `Verified by the community · ${confirmations} confirmations`;
  }
  if (inc.proVerified) return "Verified instantly · Pro reporter vouched for it";
  return `Verified by Kasala staff · ${confirmations} of ${CONFIRM_THRESHOLD} confirmations`;
}

export const typeLabels: Record<IncidentType, string> = {
  fire: "Fire",
  armed: "Armed Incident",
  crash: "Car Crash",
  medical: "Medical",
  flood: "Flooding",
  traffic: "Traffic",
  other: "Other",
  hoodlums: "Hoodlums",
  protest: "Protest",
  kidnapping: "Kidnapping",
  armed_robbery: "Armed Robbery",
  bandit: "Bandit",
  cultist: "Cultist",
  collapse: "Collapse",
  boat_accident: "Boat Accident",
};

export const typeColor: Record<IncidentType, string> = {
  fire: "#ef4444",
  armed: "#dc2626",
  crash: "#f59e0b",
  medical: "#22c55e",
  flood: "#eab308",
  traffic: "#fb923c",
  other: "#a3a3a3",
  hoodlums: "#fb923c",
  protest: "#eab308",
  kidnapping: "#8b5cf6",
  armed_robbery: "#dc2626",
  bandit: "#f43f5e",
  cultist: "#06b6d4",
  collapse: "#3b82f6",
  boat_accident: "#2563eb",
};

export const statusMeta: Record<
  IncidentStatus,
  { label: string; color: string; dotClass: string }
> = {
  // One set of names and colours for every screen. An "active" report is a
  // verified one that staff are investigating.
  unverified: { label: "Unverified", color: "#eab308", dotClass: "bg-warn" },
  active: { label: "Investigating", color: "#f97316", dotClass: "bg-danger" },
  resolved: { label: "Resolved", color: "#22c55e", dotClass: "bg-ok" },
  false_alarm: { label: "False alarm", color: "#3b82f6", dotClass: "bg-info" },
};

export const severityMeta: Record<Severity, { label: string; color: string }> = {
  critical: { label: "Critical", color: "#ef4444" },
  high: { label: "High", color: "#fb923c" },
  medium: { label: "Medium", color: "#eab308" },
  low: { label: "Low", color: "#10b981" },
  info: { label: "Info", color: "#3b82f6" },
  resolved: { label: "Resolved", color: "#22c55e" },
};

/**
 * Coerce a raw DB severity string into a known Severity. Unknown / null
 * values fall back to "info" so the row still renders instead of crashing.
 */
export function normalizeSeverity(raw: unknown): Severity {
  if (typeof raw === "string" && raw in severityMeta) {
    return raw as Severity;
  }
  if (raw === "warning") return "medium";
  return "info";
}

/** Same idea for incident types — unknown values render as "other". */
export function normalizeIncidentType(raw: unknown): IncidentType {
  if (typeof raw === "string" && raw in typeLabels) {
    return raw as IncidentType;
  }
  return "other";
}
