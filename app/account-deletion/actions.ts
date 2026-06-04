"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/app/lib/supabase/server";

export type SubmitResult = { ok: true } | { error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+0-9()\-\s]{7,20}$/;

export async function submitDeletionRequest(input: {
  email: string;
  phone: string;
  reason: string;
  reasonOther: string;
  acknowledge: boolean;
}): Promise<SubmitResult> {
  const email = input.email?.trim().toLowerCase() ?? "";
  const phone = input.phone?.trim() ?? "";
  const reasonOther = input.reasonOther?.trim() ?? "";
  const acknowledge = !!input.acknowledge;

  if (!email || !EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (phone && !PHONE_RE.test(phone)) {
    return { error: "That phone number doesn't look right." };
  }
  if (!acknowledge) {
    return { error: "Please acknowledge that this action is permanent." };
  }

  const reason = combineReason(input.reason, reasonOther);

  // Lightweight context for spam triage. headers() in Next 16 is async.
  const h = await headers();
  const ipHeader =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
  const userAgent = h.get("user-agent") ?? null;

  const supabase = createAdminClient();

  // Try to attach an existing user id so the admin reviewer sees account
  // details inline. We don't reveal whether the email exists to the submitter
  // (still return success either way).
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  const { error } = await supabase
    .from("account_deletion_requests")
    .insert({
      email,
      phone: phone || null,
      reason,
      user_id: existing?.id ?? null,
      ip: ipHeader,
      user_agent: userAgent,
    });

  if (error) {
    // The partial unique index swallows duplicate pending/in-progress
    // requests for the same email. Surface that as a success too — the user
    // already submitted a request and there's nothing to do.
    if (error.code === "23505") {
      return { ok: true };
    }
    console.error("submitDeletionRequest failed:", error);
    return { error: "Couldn't submit your request. Please try again later." };
  }

  return { ok: true };
}

function combineReason(value: string, custom: string): string | null {
  if (!value) return custom ? custom : null;
  if (value === "other") return custom ? `Other: ${custom}` : "Other";
  const map: Record<string, string> = {
    not_using: "Not using the app anymore",
    privacy: "Privacy concerns",
    new_phone: "Switching phones / accounts",
    duplicate: "Created a duplicate account",
  };
  return map[value] ?? value;
}
