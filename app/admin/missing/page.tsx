import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminNav } from "../_components/AdminNav";
import { getMissingRequests } from "../_lib/missing.data";
import { MissingList } from "./MissingList";

export const metadata: Metadata = {
  title: "Missing persons — Kasala Admin",
  description: "Review missing-person broadcast requests submitted from the mobile app.",
};

export default async function MissingPage() {
  await connection();
  const requests = await getMissingRequests();

  return (
    <div className="flex h-dvh flex-col bg-bg text-fg">
      <AdminNav />
      <main className="flex min-h-0 flex-1 flex-col">
        <MissingList requests={requests} />
      </main>
    </div>
  );
}
