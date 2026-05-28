"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase/server";

export type NewIncidentInput = {
  title: string;
  type: string;
  severity: string;
  status: string;
  description: string;
  location: string;
  address: string;
  reporterName: string;
  reporterPhone: string;
  lat: number;
  lng: number;
};

export type CreateIncidentResult = { ok: true; id: string } | { error: string };

function genId(): string {
  return `INC-${Math.random().toString(16).slice(2, 6).toUpperCase()}`;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

// Rough projection of Lagos lat/lng onto the stylized SVG map (0–2000 x, 0–1200 y).
function projectX(lng: number) {
  return Math.round(clamp(((lng - 3.25) / (3.6 - 3.25)) * 2000, 0, 2000));
}
function projectY(lat: number) {
  return Math.round(clamp(((6.62 - lat) / (6.62 - 6.4)) * 1200, 0, 1200));
}

export async function createIncident(
  input: NewIncidentInput,
): Promise<CreateIncidentResult> {
  const text = [
    input.title,
    input.type,
    input.severity,
    input.status,
    input.description,
    input.location,
    input.address,
    input.reporterName,
    input.reporterPhone,
  ];
  if (text.some((v) => !v || !v.trim())) {
    return { error: "Please fill in all required fields." };
  }
  if (Number.isNaN(input.lat) || Number.isNaN(input.lng)) {
    return { error: "Latitude and longitude must be valid numbers." };
  }

  const supabase = createAdminClient();
  const id = genId();
  const { error } = await supabase.from("incidents").insert({
    id,
    type: input.type,
    title: input.title.trim(),
    description: input.description.trim(),
    status: input.status,
    severity: input.severity,
    reporter_name: input.reporterName.trim(),
    reporter_phone: input.reporterPhone.trim(),
    location: input.location.trim(),
    address: input.address.trim(),
    lat: input.lat,
    lng: input.lng,
    map_x: projectX(input.lng),
    map_y: projectY(input.lat),
  });

  if (error) return { error: `Failed to create incident: ${error.message}` };

  revalidatePath("/admin/incidents");
  revalidatePath("/admin/dashboard");
  return { ok: true, id };
}
