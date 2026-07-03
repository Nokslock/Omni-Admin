"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/server";
import { getCurrentAdmin } from "../_lib/admin";
import { createSessionClient } from "@/app/lib/supabase/session";
import { isValidTarget, WORLDWIDE } from "@/app/lib/countries";

export type NewAdminInput = {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "moderator";
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

  // Only admins can create staff accounts. This gate is what actually enforces
  // it — the hidden UI button is just cosmetic, this endpoint is reachable
  // directly. Without it a moderator could self-escalate to admin.
  const caller = await getCurrentAdmin();
  if (!caller || caller.role !== "admin") {
    return { error: "Only admins can create staff accounts." };
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

  const assignedRole = input.role === "moderator" ? "moderator" : "admin";
  const avatarColor = assignedRole === "moderator" ? "#0ea5e9" : "#6366f1";

  // 2. Create the linked profile row with the assigned role.
  const { error: profileError } = await supabase.from("users").insert({
    id: genId(),
    name,
    email,
    avatar_color: avatarColor,
    reliability: 100,
    status: "clear",
    role: assignedRole,
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
  country: string; // ISO alpha-2 code, or "ALL" for worldwide
};

export type SendBroadcastResult = { ok: true; id: string } | { error: string };

export async function sendBroadcast(
  input: SendBroadcastInput,
): Promise<SendBroadcastResult> {
  const title = input.title?.trim();
  const body = input.body?.trim();
  const severity = input.severity;
  const audience = input.audience;
  const country = (input.country || WORLDWIDE).trim().toUpperCase();

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
  if (!isValidTarget(country)) {
    return { error: "Invalid country." };
  }

  // Make sure whoever is calling this is actually a signed-in admin — the
  // service-role client bypasses RLS so we can't rely on the DB to gate it.
  const sessionClient = await createSessionClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const sender = await getCurrentAdmin();
  if (!sender || !["admin", "moderator"].includes(sender.role)) {
    return { error: "Only admins and moderators can send broadcasts." };
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
      country,
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

export type DeleteUserResult = { ok: true } | { error: string };

export async function deleteUser(userId: string): Promise<DeleteUserResult> {
  if (!userId) return { error: "No user specified." };

  // Verify the caller is a signed-in admin.
  const sessionClient = await createSessionClient();
  const {
    data: { user: authUser },
  } = await sessionClient.auth.getUser();
  if (!authUser) return { error: "Not signed in." };

  const caller = await getCurrentAdmin();
  if (!caller || caller.role !== "admin") {
    return { error: "Only admins can delete users." };
  }

  const supabase = createAdminClient();

  // Load the target so we can (a) block self-deletion and (b) remove the
  // linked auth account, not just the profile row.
  const { data: target, error: lookupError } = await supabase
    .from("users")
    .select("id, auth_id, email")
    .eq("id", userId)
    .maybeSingle();

  if (lookupError) return { error: `Lookup failed: ${lookupError.message}` };
  if (!target) return { error: "User not found." };

  // Don't let an admin delete their own account.
  if (target.auth_id && target.auth_id === authUser.id) {
    return { error: "You can't delete your own account." };
  }

  // Delete the public profile row first so FK constraints don't block the
  // auth account deletion below.
  const { error: deleteError } = await supabase.from("users").delete().eq("id", userId);
  if (deleteError) return { error: `Failed to delete user: ${deleteError.message}` };

  // Remove the linked auth account (if any). Tolerate "not found" so a
  // half-deleted record can still be cleaned up.
  if (target.auth_id) {
    const { error: authError } = await supabase.auth.admin.deleteUser(target.auth_id);
    if (authError && !/not.*found/i.test(authError.message)) {
      return { error: `Failed to delete auth account: ${authError.message}` };
    }
  }

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function setUserStatus(
  userId: string,
  status: "clear" | "suspended",
): Promise<SetStatusResult> {
  if (status !== "clear" && status !== "suspended") {
    return { error: "Invalid status." };
  }

  const sessionClient = await createSessionClient();
  const {
    data: { user: authUser },
  } = await sessionClient.auth.getUser();
  if (!authUser) return { error: "Not signed in." };

  const caller = await getCurrentAdmin();
  if (!caller || !["admin", "moderator"].includes(caller.role)) {
    return { error: "Insufficient permissions." };
  }

  const supabase = createAdminClient();

  const { data: target } = await supabase
    .from("users")
    .select("role, auth_id")
    .eq("id", userId)
    .maybeSingle();

  // Don't let anyone suspend their own account (would lock them out).
  if (target?.auth_id && target.auth_id === authUser.id) {
    return { error: "You can't change your own account status." };
  }

  // Moderators cannot act on admin or moderator accounts.
  if (caller.role === "moderator" && target && ["admin", "moderator"].includes(target.role)) {
    return { error: "Moderators cannot modify admin or moderator accounts." };
  }

  const { error } = await supabase
    .from("users")
    .update({ status })
    .eq("id", userId);

  if (error) return { error: `Failed to update status: ${error.message}` };

  revalidatePath("/admin/users");
  return { ok: true };
}
