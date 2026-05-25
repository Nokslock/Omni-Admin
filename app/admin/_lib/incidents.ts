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
    reportedDate: "2025-11-27",
    location: "Apapa Wharf Rd, Lagos",
    address: "Apapa Port",
    coords: { lat: 6.4488, lng: 3.3621 },
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
    reportedDate: "2025-11-27",
    location: "Admiralty Way, Lekki",
    address: "Lekki Phase 1",
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
    reportedDate: "2025-11-27",
    location: "Third Mainland Bridge",
    address: "Third Mainland Bridge",
    coords: { lat: 6.5121, lng: 3.392 },
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
    severity: "medium",
    reporter: "Funke Akindele",
    reporterPhone: "+234 706 220 5512",
    reportedAt: "28m ago",
    reportedDate: "2025-11-27",
    location: "Tejuosho Market, Yaba",
    address: "Yaba Market",
    coords: { lat: 6.5095, lng: 3.3735 },
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
    reportedDate: "2025-11-27",
    location: "Chevron Drive, Lekki",
    address: "Lekki Phase 2",
    coords: { lat: 6.4358, lng: 3.5483 },
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
    severity: "high",
    reporter: "Emeka Nwosu",
    reporterPhone: "+234 805 008 4412",
    reportedAt: "52m ago",
    reportedDate: "2025-11-27",
    location: "Ikeja Under Bridge",
    address: "Ikeja",
    coords: { lat: 6.5917, lng: 3.3417 },
    mapXY: { x: 1370, y: 235 },
  },
  {
    id: "INC-7F24",
    type: "power",
    typeLabel: "Power Outage",
    title: "Area-wide outage in Surulere",
    description:
      "Multiple blocks without power since 14:20. IKEDC notified, ETA unknown.",
    status: "investigating",
    severity: "info",
    reporter: "Kemi Adeyemi",
    reporterPhone: "+234 901 220 9911",
    reportedAt: "1h ago",
    reportedDate: "2025-11-27",
    location: "Bode Thomas, Surulere",
    address: "Surulere",
    coords: { lat: 6.4928, lng: 3.3589 },
    mapXY: { x: 745, y: 580 },
  },
  {
    id: "INC-7F22",
    type: "fire",
    typeLabel: "Fire",
    title: "Cooking gas fire — Mushin tenement",
    description:
      "Small kitchen fire contained by neighbors. No injuries reported.",
    status: "resolved",
    severity: "resolved",
    reporter: "Ibrahim Musa",
    reporterPhone: "+234 813 309 0066",
    reportedAt: "2h ago",
    reportedDate: "2025-11-27",
    location: "Olosa St, Mushin",
    address: "Mushin",
    coords: { lat: 6.5341, lng: 3.3539 },
    mapXY: { x: 920, y: 460 },
  },
  {
    id: "INC-7F1F",
    type: "crash",
    typeLabel: "Car Crash",
    title: "Motorcycle collision at Maryland",
    description: "Rider stable, transported by ambulance. Lane cleared.",
    status: "resolved",
    severity: "resolved",
    reporter: "Aisha Yusuf",
    reporterPhone: "+234 802 991 7724",
    reportedAt: "3h ago",
    reportedDate: "2025-11-27",
    location: "Mobolaji Bank Anthony Way",
    address: "Maryland",
    coords: { lat: 6.5712, lng: 3.3672 },
    mapXY: { x: 1700, y: 285 },
  },
  {
    id: "INC-7F1A",
    type: "armed",
    typeLabel: "Armed Incident",
    title: "False alarm — staged shop alarm",
    description:
      "Reported as armed entry; shop owner confirmed alarm system malfunction.",
    status: "false_alarm",
    severity: "resolved",
    reporter: "Olumide Fashola",
    reporterPhone: "+234 802 880 4419",
    reportedAt: "4h ago",
    reportedDate: "2025-11-27",
    location: "Allen Avenue, Ikeja",
    address: "Ikeja",
    coords: { lat: 6.6018, lng: 3.3506 },
    mapXY: { x: 1380, y: 220 },
  },
  {
    id: "INC-7F15",
    type: "medical",
    typeLabel: "Medical",
    title: "Diabetic emergency, Festac Town",
    description:
      "Hypoglycemic episode. Patient stabilized on-scene by neighbor with glucose.",
    status: "resolved",
    severity: "resolved",
    reporter: "Bisola Lawal",
    reporterPhone: "+234 706 442 7711",
    reportedAt: "5h ago",
    reportedDate: "2025-11-27",
    location: "2nd Avenue, Festac",
    address: "Festac Town",
    coords: { lat: 6.4707, lng: 3.288 },
    mapXY: { x: 480, y: 760 },
  },
  {
    id: "INC-7F12",
    type: "flood",
    typeLabel: "Flooding",
    title: "Drain overflow — Gbagada Phase 2",
    description:
      "Blocked drain causing pooling on Diya Street after evening rain.",
    status: "investigating",
    severity: "medium",
    reporter: "Yemi Adesina",
    reporterPhone: "+234 813 002 1147",
    reportedAt: "7h ago",
    reportedDate: "2025-11-27",
    location: "Diya St, Gbagada",
    address: "Gbagada",
    coords: { lat: 6.5511, lng: 3.3858 },
    mapXY: { x: 1320, y: 380 },
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

export const severityMeta: Record<Severity, { label: string; color: string }> = {
  critical: { label: "Critical", color: "#ef4444" },
  high: { label: "High", color: "#fb923c" },
  medium: { label: "Medium", color: "#eab308" },
  info: { label: "Info", color: "#3b82f6" },
  resolved: { label: "Resolved", color: "#22c55e" },
};
