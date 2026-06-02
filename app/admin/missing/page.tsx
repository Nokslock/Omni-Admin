import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminNav } from "../_components/AdminNav";
import { getMissingRequests } from "../_lib/missing.data";
import { MissingList } from "./MissingList";

export const metadata: Metadata = {
  title: "Missing persons — Omni Admin",
  description: "Review missing-person broadcast requests submitted from the mobile app.",
};

export default async function MissingPage() {
  await connection();
  const requests = await getMissingRequests();

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <AdminNav />
      <main className="flex-1 px-6 py-8">
        <MissingList requests={requests} />
      </main>
    </div>
  );
}
