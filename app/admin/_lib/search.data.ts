import "server-only";
import { createAdminClient } from "@/app/lib/supabase/server";
import {
  normalizeIncidentType,
  typeLabels,
  type IncidentStatus,
  type IncidentType,
} from "./incidents";

export type IncidentHit = {
  id: string;
  title: string;
  type: IncidentType;
  typeLabel: string;
  status: IncidentStatus;
  location: string;
};

export type UserHit = {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
};

export type SearchResults = {
  incidents: IncidentHit[];
  users: UserHit[];
};

const PER_GROUP = 6;

// PostgREST's `.or()` takes a comma/parenthesis-delimited filter string, so any
// of those characters in raw user input would corrupt the query. Strip the
// structural characters (plus the ilike wildcards) and collapse whitespace.
function sanitize(query: string): string {
  return query
    .replace(/[,()%*]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function searchAll(rawQuery: string): Promise<SearchResults> {
  const q = sanitize(rawQuery);
  if (q.length < 2) return { incidents: [], users: [] };

  const supabase = createAdminClient();
  const like = `%${q}%`;

  const [incidentsRes, usersRes] = await Promise.all([
    supabase
      .from("incidents")
      .select("id, type, title, status, location")
      .or(
        [
          `title.ilike.${like}`,
          `location.ilike.${like}`,
          `address.ilike.${like}`,
          `reporter_name.ilike.${like}`,
          `id.ilike.${like}`,
          `type.ilike.${like}`,
        ].join(","),
      )
      .order("reported_at", { ascending: false })
      .limit(PER_GROUP),
    supabase
      .from("users")
      .select("id, name, email, avatar_color")
      .or([`name.ilike.${like}`, `email.ilike.${like}`].join(","))
      .limit(PER_GROUP),
  ]);

  const incidents: IncidentHit[] = (
    (incidentsRes.data as
      | { id: string; type: string; title: string; status: IncidentStatus; location: string }[]
      | null) ?? []
  ).map((row) => {
    const type = normalizeIncidentType(row.type);
    return {
      id: row.id,
      title: row.title,
      type,
      typeLabel: typeLabels[type],
      status: row.status,
      location: row.location,
    };
  });

  const users: UserHit[] = (
    (usersRes.data as
      | { id: string; name: string; email: string; avatar_color: string }[]
      | null) ?? []
  ).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    avatarColor: row.avatar_color,
  }));

  return { incidents, users };
}
