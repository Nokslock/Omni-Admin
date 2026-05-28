import "server-only";
import { createSessionClient } from "@/app/lib/supabase/session";
import { createAdminClient } from "@/app/lib/supabase/server";

export type CurrentAdmin = {
  name: string;
  email: string;
  role: string;
  initials: string;
};

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (parts[0] ?? "").slice(0, 2).toUpperCase();
}

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("name, email, role")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (!profile) return null;

  return {
    name: profile.name,
    email: profile.email ?? user.email ?? "",
    role: profile.role,
    initials: initialsFrom(profile.name),
  };
}
