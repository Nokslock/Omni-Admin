import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminNav } from "../_components/AdminNav";
import { getUsers } from "../_lib/users.data";
import { getCurrentAdmin } from "../_lib/admin";
import { UsersTable } from "./UsersTable";

export const metadata: Metadata = {
  title: "Users — Kasala Admin",
  description: "Browse and manage verified mobile reporters.",
};

export default async function UsersPage() {
  await connection();
  const [users, currentAdmin] = await Promise.all([getUsers(), getCurrentAdmin()]);

  return (
    <div className="flex h-dvh flex-col bg-bg text-fg">
      <AdminNav />
      <main className="flex min-h-0 flex-1 flex-col">
        <UsersTable users={users} currentEmail={currentAdmin?.email ?? null} currentRole={currentAdmin?.role ?? null} />
      </main>
    </div>
  );
}
