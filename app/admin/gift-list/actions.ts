"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/server";
import { getCurrentAdmin } from "../_lib/admin";
import { GIFT_LANGS, validateGift, type GiftInput } from "../_lib/gift-types";

export type GiftListResult = { ok: true; message: string } | { error: string };

const ADMINS_ONLY = "Only admins can change the gift list.";

async function isAdmin(): Promise<boolean> {
  const admin = await getCurrentAdmin();
  return admin?.role === "admin";
}

function done(message: string): GiftListResult {
  revalidatePath("/admin/gift-list");
  revalidatePath("/admin/payouts");
  return { ok: true, message };
}

/** Adds a gift ([isNew]) or updates one. The ID can't change once created. */
export async function saveGift(input: GiftInput, isNew: boolean): Promise<GiftListResult> {
  if (!(await isAdmin())) return { error: ADMINS_ONLY };
  const problem = validateGift(input, isNew);
  if (problem) return { error: problem };

  const names: Record<string, string> = {};
  for (const { code } of GIFT_LANGS) {
    const v = input.names[code]?.trim();
    if (v) names[code] = v;
  }
  const row = {
    emoji: input.emoji.trim(),
    image_url: input.imageUrl.trim() || null,
    names,
    coins: input.coins,
    active: input.active,
  };
  const supabase = createAdminClient();

  if (isNew) {
    const { data: last } = await supabase
      .from("gift_types")
      .select("sort")
      .order("sort", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { error } = await supabase
      .from("gift_types")
      .insert({ id: input.id, ...row, sort: Number(last?.sort ?? 0) + 1 });
    if (error) {
      return {
        error: error.code === "23505" ? `There's already a gift with the ID "${input.id}".` : error.message,
      };
    }
    return done(`${row.emoji} ${names.en} added.`);
  }

  const { error, count } = await supabase
    .from("gift_types")
    .update(row, { count: "exact" })
    .eq("id", input.id);
  if (error) return { error: error.message };
  if (!count) return { error: "That gift no longer exists. Reload the page." };
  return done(`${row.emoji} ${names.en} saved.`);
}

/** Shows or hides a gift in the app. Hidden gifts keep their history. */
export async function setGiftActive(id: string, active: boolean): Promise<GiftListResult> {
  if (!(await isAdmin())) return { error: ADMINS_ONLY };
  const { error } = await createAdminClient().from("gift_types").update({ active }).eq("id", id);
  if (error) return { error: error.message };
  return done(active ? "The gift is back in the app." : "The gift is hidden from the app.");
}

/** Saves a new order: [ids] from first to last. */
export async function reorderGifts(ids: string[]): Promise<GiftListResult> {
  if (!(await isAdmin())) return { error: ADMINS_ONLY };
  const supabase = createAdminClient();
  const results = await Promise.all(
    ids.map((id, i) => supabase.from("gift_types").update({ sort: i + 1 }).eq("id", id)),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };
  return done("Order saved.");
}

/** Deletes a gift that has never been sent. Sent gifts can only be hidden. */
export async function deleteGift(id: string): Promise<GiftListResult> {
  if (!(await isAdmin())) return { error: ADMINS_ONLY };
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("token_ledger")
    .select("id", { count: "exact", head: true })
    .eq("gift_id", id);
  if (count) return { error: "This gift has been sent, so it can only be hidden, not deleted." };
  const { error } = await supabase.from("gift_types").delete().eq("id", id);
  if (error) {
    return {
      error:
        error.code === "23503"
          ? "This gift has been sent, so it can only be hidden, not deleted."
          : error.message,
    };
  }
  return done("Gift deleted.");
}
