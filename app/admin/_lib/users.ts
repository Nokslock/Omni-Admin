export type UserStatus = "clear" | "investigation" | "suspended";

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
};

export const users: User[] = [
  { id: "u_001", name: "Adebayo Ogundimu", email: "adebayo.o@gmail.com", phone: "+234 803 412 9871", phoneVerified: true, verified: true, avatarColor: "#f97316", joined: "12 Aug 24", joinedDate: "2024-08-12", reports: 24, reliability: 96, status: "clear" },
  { id: "u_002", name: "Chidinma Okeke", email: "chidi.okeke@outlook.com", phone: "+234 814 220 1144", phoneVerified: true, verified: true, avatarColor: "#14b8a6", joined: "30 Jun 24", joinedDate: "2024-06-30", reports: 38, reliability: 91, status: "clear" },
  { id: "u_003", name: "Tunde Bakare", email: "tunde.bakare@yahoo.com", phone: "+234 802 117 6650", phoneVerified: true, verified: true, avatarColor: "#22c55e", joined: "04 Nov 23", joinedDate: "2023-11-04", reports: 112, reliability: 88, status: "clear" },
  { id: "u_004", name: "Funke Akindele", email: "funke.k@protonmail.com", phone: "+234 805 776 0212", phoneVerified: true, verified: true, avatarColor: "#a855f7", joined: "22 Jan 25", joinedDate: "2025-01-22", reports: 9, reliability: 78, status: "clear" },
  { id: "u_005", name: "Ngozi Eze", email: "ngozi.eze@gmail.com", phone: "+234 807 991 4423", phoneVerified: true, verified: true, avatarColor: "#fb923c", joined: "18 Apr 24", joinedDate: "2024-04-18", reports: 17, reliability: 94, status: "clear" },
  { id: "u_006", name: "Emeka Nwosu", email: "emeka.nwosu@gmail.com", phone: "+234 803 552 8810", phoneVerified: true, verified: true, avatarColor: "#3b82f6", joined: "15 Sep 23", joinedDate: "2023-09-15", reports: 86, reliability: 82, status: "clear" },
  { id: "u_007", name: "Kemi Adeyemi", email: "kemi.adeyemi@gmail.com", phone: "+234 816 002 7733", phoneVerified: true, verified: true, avatarColor: "#84cc16", joined: "01 Oct 24", joinedDate: "2024-10-01", reports: 14, reliability: 100, status: "clear" },
  { id: "u_008", name: "Ibrahim Musa", email: "ibrahim.musa@yahoo.com", phone: "+234 818 414 6021", phoneVerified: true, verified: true, avatarColor: "#ec4899", joined: "08 Mar 25", joinedDate: "2025-03-08", reports: 5, reliability: 60, status: "clear" },
  { id: "u_009", name: "Aisha Yusuf", email: "aisha.yusuf@gmail.com", phone: "+234 901 333 5571", phoneVerified: true, verified: true, avatarColor: "#eab308", joined: "14 Feb 25", joinedDate: "2025-02-14", reports: 7, reliability: 86, status: "clear" },
  { id: "u_010", name: "Olumide Fashola", email: "olu.fashola@hotmail.com", phone: "+234 805 100 9982", phoneVerified: true, verified: true, avatarColor: "#0ea5e9", joined: "19 Dec 24", joinedDate: "2024-12-19", reports: 22, reliability: 32, status: "investigation" },
  { id: "u_011", name: "Bisola Lawal", email: "bisola.lawal@gmail.com", phone: "+234 706 442 7711", phoneVerified: true, verified: true, avatarColor: "#6366f1", joined: "07 May 24", joinedDate: "2024-05-07", reports: 41, reliability: 89, status: "clear" },
  { id: "u_012", name: "Yemi Adesina", email: "yemi.adesina@gmail.com", phone: "+234 813 002 1147", phoneVerified: true, verified: true, avatarColor: "#10b981", joined: "29 Sep 24", joinedDate: "2024-09-29", reports: 19, reliability: 84, status: "clear" },
  { id: "u_013", name: "Tobi Adesanya", email: "t.adesanya@outlook.com", phone: "+234 803 220 6610", phoneVerified: true, verified: true, avatarColor: "#f43f5e", joined: "11 Feb 24", joinedDate: "2024-02-11", reports: 63, reliability: 71, status: "clear" },
  { id: "u_014", name: "Mariam Aliyu", email: "mariam.aliyu@gmail.com", phone: "+234 814 558 2200", phoneVerified: true, verified: true, avatarColor: "#06b6d4", joined: "25 Jul 24", joinedDate: "2024-07-25", reports: 31, reliability: 93, status: "clear" },
  { id: "u_015", name: "Segun Akinwale", email: "segun.akin@yahoo.com", phone: "+234 803 776 1182", phoneVerified: false, verified: false, avatarColor: "#ef4444", joined: "02 Jan 25", joinedDate: "2025-01-02", reports: 3, reliability: 22, status: "suspended" },
];

export const userStatusMeta: Record<
  UserStatus,
  { label: string; color: string; actionLabel: "Suspend" | "Reinstate" }
> = {
  clear: { label: "Resolved", color: "#22c55e", actionLabel: "Suspend" },
  investigation: { label: "Under Investigation", color: "#f59e0b", actionLabel: "Suspend" },
  suspended: { label: "Suspended", color: "#ef4444", actionLabel: "Reinstate" },
};

export function reliabilityColor(r: number): string {
  if (r >= 80) return "#22c55e";
  if (r >= 60) return "#eab308";
  return "#ef4444";
}
