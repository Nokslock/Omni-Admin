"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/server";
import { getCurrentAdmin } from "../_lib/admin";
import { createSessionClient } from "@/app/lib/supabase/session";

export type NewAdminInput = {
  name: string;
  email: string;
  password: string;
};

export type CreateAdminResult = { ok: true } | { error: string };

function genId(): string {
  return `u_${Math.random().toString(16).slice(2, 8)}`;
}

export async function createAdmin(input: NewAdminInput): Promise<CreateAdminResult> {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const password = input.password ?? "";

  if (!name || !email || !password) {
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

export type BroadcastSeverity = "info" | "warning" | "critical";
export type BroadcastAudience = "all" | "admins" | "users";

export type SendBroadcastInput = {
  title: string;
  body: string;
  severity: BroadcastSeverity;
  audience: BroadcastAudience;
};

export type SendBroadcastResult = { ok: true; id: string } | { error: string };

export async function sendBroadcast(
  input: SendBroadcastInput,
): Promise<SendBroadcastResult> {
  const title = input.title?.trim();
  const body = input.body?.trim();
  const severity = input.severity;
  const audience = input.audience;

  if (!title || !body) {
    return { error: "Please give the broadcast a title and a message." };
  }
  if (title.length > 120) {
    return { error: "Title is too long (max 120 characters)." };
  }
  if (body.length > 2000) {
    return { error: "Message is too long (max 2000 characters)." };
  }
  if (!["info", "warning", "critical"].includes(severity)) {
    return { error: "Invalid severity." };
  }
  if (!["all", "admins", "users"].includes(audience)) {
    return { error: "Invalid audience." };
  }

  // Make sure whoever is calling this is actually a signed-in admin — the
  // service-role client bypasses RLS so we can't rely on the DB to gate it.
  const sessionClient = await createSessionClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const sender = await getCurrentAdmin();
  if (!sender || sender.role !== "admin") {
    return { error: "Only admins can send broadcasts." };
  }

  const supabase = createAdminClient();

  // Look up the sender's profile id so we can store it as a FK reference.
  const { data: senderRow } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .maybeSingle();

  const { data, error } = await supabase
    .from("broadcasts")
    .insert({
      title,
      body,
      severity,
      audience,
      sent_by: senderRow?.id ?? null,
      sent_by_name: sender.name,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: `Failed to send broadcast: ${error?.message ?? "unknown error"}` };
  }

  revalidatePath("/admin/users");
  return { ok: true, id: data.id };
}

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
