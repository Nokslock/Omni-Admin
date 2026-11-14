import type { Metadata } from "next";
import { connection } from "next/server";
import { getCurrentAdmin } from "../_lib/admin";
import { getPayoutOverview } from "../_lib/payouts.data";
import { PayoutsList } from "./PayoutsList";

export const metadata: Metadata = {
  title: "Payouts — Kasala Admin",
  description: "Cash-out requests from the mobile app, and what is coming up.",
};

export default async function PayoutsPage() {
  await connection();
  const [overview, admin] = await Promise.all([getPayoutOverview(), getCurrentAdmin()]);

  return (
    <div className="flex h-full flex-col bg-bg text-fg">
      <main className="flex min-h-0 flex-1 flex-col">
        <PayoutsList overview={overview} canAct={admin?.role === "admin"} />
      </main>
    </div>
  );
}
