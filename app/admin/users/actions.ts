"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/server";

export type NewAdminInput = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

export type CreateAdminResult = { ok: true } | { error: string };

function genId(): string {
  return `u_${Math.random().toString(16).slice(2, 8)}`;
}

export async function createAdmin(input: NewAdminInput): Promise<CreateAdminResult> {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const phone = input.phone?.trim();
  const password = input.password ?? "";

  if (!name || !email || !phone || !password) {
    return { error: "Please fill in all fields." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const supabase = createAdminClient();

  // 1. Create the auth account (email pre-confirmed so they can sign in right away).
  const { data: created, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (authError || !created?.user) {
    return { error: authError?.message ?? "Could not create the auth account." };
  }

  const authId = created.user.id;

  // 2. Create the linked profile row with the admin role.
  const { error: profileError } = await supabase.from("users").insert({
    id: genId(),
    name,
    email,
    phone,
    phone_verified: true,
    verified: true,
    avatar_color: "#6366f1",
    reliability: 100,
    status: "clear",
    role: "admin",
    auth_id: authId,
  });

  if (profileError) {
    // Roll back the orphaned auth account so a retry isn't blocked by a duplicate email.
    await supabase.auth.admin.deleteUser(authId);
    return { error: `Failed to create admin profile: ${profileError.message}` };
  }

  revalidatePath("/admin/users");
  return { ok: true };
}

export type SetStatusResult = { ok: true } | { error: string };

export async function setUserStatus(
  userId: string,
  status: "clear" | "suspended",
): Promise<SetStatusResult> {
  if (status !== "clear" && status !== "suspended") {
    return { error: "Invalid status." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("users")
    .update({ status })
    .eq("id", userId);

  if (error) return { error: `Failed to update status: ${error.message}` };

  revalidatePath("/admin/users");
  return { ok: true };
}
