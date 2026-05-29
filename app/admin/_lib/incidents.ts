export type IncidentType =
  | "fire"
  | "armed"
  | "crash"
  | "medical"
  | "flood"
  | "traffic"
  | "other";

export type IncidentStatus =
  | "active"
  | "investigating"
  | "resolved"
  | "false_alarm";

export type Severity = "critical" | "high" | "medium" | "info" | "resolved";

export type Incident = {
  id: string;
  type: IncidentType;
  typeLabel: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: Severity;
  reporter: string;
  reporterPhone: string;
  reportedAt: string; // human-readable "3m ago"
  reportedDate: string; // "2025-11-27"
  location: string;
  address: string;
  coords: { lat: number; lng: number };
  /** Position on our SVG map (0–2000 x, 0–1200 y) */
  mapXY: { x: number; y: number };
};

export const typeLabels: Record<IncidentType, string> = {
  fire: "Fire",
  armed: "Armed Incident",
  crash: "Car Crash",
  medical: "Medical",
  flood: "Flooding",
  traffic: "Traffic",
  other: "Other",
};

export const typeColor: Record<IncidentType, string> = {
  fire: "#ef4444",
  armed: "#dc2626",
  crash: "#f59e0b",
  medical: "#22c55e",
  flood: "#eab308",
  traffic: "#fb923c",
  other: "#a3a3a3",
};

export const statusMeta: Record<
  IncidentStatus,
  { label: string; color: string; dotClass: string }
> = {
  active: { label: "Active", color: "#ef4444", dotClass: "bg-danger" },
  investigating: {
    label: "Under Investigation",
    color: "#f59e0b",
    dotClass: "bg-warn",
  },
  resolved: { label: "Resolved", color: "#22c55e", dotClass: "bg-ok" },
  false_alarm: { label: "False Alarm", color: "#3b82f6", dotClass: "bg-info" },
};

export const severityMeta: Record<Severity, { label: string; color: string }> = {
  critical: { label: "Critical", color: "#ef4444" },
  high: { label: "High", color: "#fb923c" },
  medium: { label: "Medium", color: "#eab308" },
  info: { label: "Info", color: "#3b82f6" },
  resolved: { label: "Resolved", color: "#22c55e" },
};
