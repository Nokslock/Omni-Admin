"use server";

import { createSessionClient } from "@/app/lib/supabase/session";
import { createAdminClient } from "@/app/lib/supabase/server";

export type SignInResult = { error: string } | { ok: true };

export async function signInAdmin(
  email: string,
  password: string,
): Promise<SignInResult> {
  const supabase = await createSessionClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "Invalid email or password." };
  }

  // Role lives in public.users (RLS-locked), so read it with the service role.
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("role")
    .eq("auth_id", data.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return { error: "This account doesn't have admin access." };
  }

  return { ok: true };
}
