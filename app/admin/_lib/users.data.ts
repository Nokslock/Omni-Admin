import "server-only";
import { createAdminClient } from "@/app/lib/supabase/server";
import type { User, UserRole, UserStatus } from "./users";

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  phone_verified: boolean;
  verified: boolean;
  avatar_color: string;
  joined_date: string;
  reports: number;
  reliability: number;
  status: UserStatus;
  role: UserRole;
};

function formatJoined(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = String(d.getFullYear()).slice(-2);
  return `${day} ${month} ${year}`;
}

function mapRow(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    phoneVerified: row.phone_verified,
    verified: row.verified,
    avatarColor: row.avatar_color,
    joined: formatJoined(row.joined_date),
    joinedDate: row.joined_date,
    reports: row.reports,
    reliability: row.reliability,
    status: row.status,
    role: row.role,
  };
}

export async function getUsers(): Promise<User[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, name, email, phone, phone_verified, verified, avatar_color, joined_date, reports, reliability, status, role",
    )
    .order("reports", { ascending: false });

  if (error) {
    throw new Error(`Failed to load users: ${error.message}`);
  }

  return (data as UserRow[]).map(mapRow);
}
