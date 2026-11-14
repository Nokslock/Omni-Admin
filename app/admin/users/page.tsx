import type { Metadata } from "next";
import { connection } from "next/server";
import { getUsers } from "../_lib/users.data";
import { getCurrentAdmin } from "../_lib/admin";
import { UsersTable } from "./UsersTable";

export const metadata: Metadata = {
  title: "Users — Kasala Admin",
  description: "Browse and manage verified mobile reporters.",
};

export default async function UsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const sp = await searchParams;
  const role = typeof sp.role === "string" ? sp.role : undefined;
  const [users, currentAdmin] = await Promise.all([getUsers(), getCurrentAdmin()]);

  return (
    <div className="flex h-full flex-col bg-bg text-fg">
      <main className="flex min-h-0 flex-1 flex-col">
        <UsersTable key={role ?? "all"} initialRole={role} users={users} currentEmail={currentAdmin?.email ?? null} currentRole={currentAdmin?.role ?? null} />
      </main>
    </div>
  );
}
