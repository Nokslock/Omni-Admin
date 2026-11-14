"use server";

import { getIncidentFeedback, type IncidentFeedback } from "../_lib/feedback.data";

/** Community confirmations/flags for the triage panel. */
export async function loadIncidentFeedback(
  incidentId: string,
): Promise<{ ok: true; feedback: IncidentFeedback[] } | { error: string }> {
  try {
    return { ok: true, feedback: await getIncidentFeedback(incidentId) };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to load feedback." };
  }
}
