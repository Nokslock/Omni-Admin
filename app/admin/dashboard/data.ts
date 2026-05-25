export type IncidentType =
  | "fire"
  | "armed"
  | "crash"
  | "medical"
  | "flood"
  | "traffic"
  | "power"
  | "other";

export type IncidentStatus =
  | "active"
  | "investigating"
  | "resolved"
  | "false_alarm";

export type Severity = "critical" | "high" | "medium" | "low";

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
  location: string;
  coords: { lat: number; lng: number };
  /** Position on our SVG map (0–960 x, 0–540 y) */
  mapXY: { x: number; y: number };
};

export const incidents: Incident[] = [
  {
    id: "INC-7F3A",
    type: "fire",
    typeLabel: "Fire",
    title: "Warehouse fire at Apapa Port",
    description:
      "Heavy black smoke, multiple structures involved. Emergency response dispatched.",
    status: "active",
    severity: "critical",
    reporter: "Adebayo Ogundimu",
    reporterPhone: "+234 803 412 8821",
    reportedAt: "3m ago",
    location: "Apapa Port",
    coords: { lat: 6.4502, lng: 3.3681 },
    mapXY: { x: 1185, y: 805 },
  },
  {
    id: "INC-7F2B",
    type: "armed",
    typeLabel: "Armed Incident",
    title: "Armed robbery near Lekki Phase 1 gate",
    description:
      "Three suspects on motorbikes reported on Admiralty Way. Witnesses sheltering.",
    status: "investigating",
    severity: "critical",
    reporter: "Chidinma Okeke",
    reporterPhone: "+234 814 220 1144",
    reportedAt: "8m ago",
    location: "Lekki Phase 1",
    coords: { lat: 6.4382, lng: 3.4717 },
    mapXY: { x: 1595, y: 760 },
  },
  {
    id: "INC-7F29",
    type: "crash",
    typeLabel: "Car Crash",
    title: "Multi-vehicle crash on Third Mainland",
    description:
      "Northbound lanes blocked after collision involving a tanker and two cars.",
    status: "active",
    severity: "high",
    reporter: "Tunde Bakare",
    reporterPhone: "+234 802 778 0091",
    reportedAt: "23m ago",
    location: "Third Mainland Bridge",
    coords: { lat: 6.4774, lng: 3.4002 },
    mapXY: { x: 1270, y: 480 },
  },
  {
    id: "INC-7F28",
    type: "medical",
    typeLabel: "Medical",
    title: "Cardiac arrest reported at Yaba Market",
    description:
      "Vendor collapsed, bystander CPR in progress. Ambulance ETA 6 min.",
    status: "active",
    severity: "high",
    reporter: "Funke Adesanya",
    reporterPhone: "+234 706 220 5512",
    reportedAt: "28m ago",
    location: "Yaba Market",
    coords: { lat: 6.5095, lng: 3.3711 },
    mapXY: { x: 1145, y: 545 },
  },
  {
    id: "INC-7F27",
    type: "flood",
    typeLabel: "Flooding",
    title: "Flash flooding in Lekki Phase 2",
    description:
      "Knee-high water on Chevron Drive after heavy rainfall. Vehicles stranded.",
    status: "investigating",
    severity: "medium",
    reporter: "Ngozi Eze",
    reporterPhone: "+234 813 449 2207",
    reportedAt: "34m ago",
    location: "Lekki Phase 2",
    coords: { lat: 6.4321, lng: 3.5103 },
    mapXY: { x: 1700, y: 410 },
  },
  {
    id: "INC-7F26",
    type: "traffic",
    typeLabel: "Traffic",
    title: "Heavy gridlock at Ikeja Underbridge",
    description:
      "Traffic at standstill for 40+ minutes. LASTMA reportedly on the way.",
    status: "active",
    severity: "medium",
    reporter: "Olumide Salami",
    reporterPhone: "+234 805 008 4412",
    reportedAt: "47m ago",
    location: "Ikeja",
    coords: { lat: 6.6018, lng: 3.3515 },
    mapXY: { x: 1370, y: 235 },
  },
  {
    id: "INC-7F25",
    type: "power",
    typeLabel: "Power Outage",
    title: "Transformer explosion on Adeola Odeku",
    description:
      "Loud bang reported; sparks visible. IKEDC notified, area without power.",
    status: "investigating",
    severity: "high",
    reporter: "Bisi Ajao",
    reporterPhone: "+234 901 220 9911",
    reportedAt: "1h ago",
    location: "Victoria Island",
    coords: { lat: 6.4264, lng: 3.4292 },
    mapXY: { x: 1090, y: 625 },
  },
  {
    id: "INC-7F24",
    type: "medical",
    typeLabel: "Medical",
    title: "Pedestrian struck near Maryland",
    description: "Cyclist down, conscious. First responders requested.",
    status: "resolved",
    severity: "high",
    reporter: "Adekunle O.",
    reporterPhone: "+234 802 991 7724",
    reportedAt: "2h ago",
    location: "Maryland",
    coords: { lat: 6.5712, lng: 3.3712 },
    mapXY: { x: 1700, y: 285 },
  },
  {
    id: "INC-7F23",
    type: "fire",
    typeLabel: "Fire",
    title: "Generator fire in Surulere walk-up",
    description: "Fire contained by neighbors, minor injuries reported.",
    status: "resolved",
    severity: "medium",
    reporter: "Yemi Daniel",
    reporterPhone: "+234 813 309 0066",
    reportedAt: "3h ago",
    location: "Surulere",
    coords: { lat: 6.5005, lng: 3.3585 },
    mapXY: { x: 745, y: 580 },
  },
  {
    id: "INC-7F22",
    type: "armed",
    typeLabel: "Armed Incident",
    title: "Suspicious group on Carter Bridge",
    description:
      "Group of four lingering near pedestrian path. False alarm — community patrol on site.",
    status: "false_alarm",
    severity: "low",
    reporter: "Anonymous",
    reporterPhone: "—",
    reportedAt: "4h ago",
    location: "Carter Bridge",
    coords: { lat: 6.4582, lng: 3.3892 },
    mapXY: { x: 920, y: 700 },
  },
];

export const typeColor: Record<IncidentType, string> = {
  fire: "#ef4444",
  armed: "#dc2626",
  crash: "#f59e0b",
  medical: "#22c55e",
  flood: "#eab308",
  traffic: "#fb923c",
  power: "#3b82f6",
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
