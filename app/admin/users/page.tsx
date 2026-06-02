import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminNav } from "../_components/AdminNav";
import { getUsers } from "../_lib/users.data";
import { UsersTable } from "./UsersTable";

export const metadata: Metadata = {
  title: "Users — Kasala Admin",
  description: "Browse and manage verified mobile reporters.",
};

export default async function UsersPage() {
  await connection();
  const users = await getUsers();

  return (
    <div className="flex h-dvh flex-col bg-bg text-fg">
      <AdminNav />
      <main className="flex min-h-0 flex-1 flex-col">
        <UsersTable users={users} />
      </main>
    </div>
  );
}
