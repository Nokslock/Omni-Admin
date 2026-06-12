"use server";

import { getCurrentAdmin } from "../_lib/admin";
import { searchAll, type SearchResults } from "../_lib/search.data";

export async function globalSearch(query: string): Promise<SearchResults> {
  // Global search reaches across every reporter and incident, so it must stay
  // behind the same admin guard as the rest of the dashboard.
  const admin = await getCurrentAdmin();
  if (!admin) return { incidents: [], users: [] };

  return searchAll(query);
}
