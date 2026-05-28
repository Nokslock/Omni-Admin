"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/app/lib/supabase/session";

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
