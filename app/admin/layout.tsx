import type { Metadata } from "next";
import { getCurrentAdmin } from "./_lib/admin";
import { getNavCounts } from "./_lib/nav-counts.data";
import { AdminProvider } from "./_components/AdminProvider";
import { AdminShell } from "./_components/AdminShell";

// The admin dashboard is behind auth and renders dynamic operational data —
// it has no SEO value and should never appear in search results. Setting
// noindex/nofollow at the layout cascades to every route under /admin.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  // Signed-out visitors only ever see the login page — skip the badge queries.
  const counts = admin
    ? await getNavCounts()
    : { unverified: 0, deletions: 0, reportedComments: 0, pendingAds: 0, pendingPayouts: 0 };
  return (
    <AdminProvider admin={admin}>
      <AdminShell counts={counts}>{children}</AdminShell>
    </AdminProvider>
  );
}
