import type { Metadata } from "next";
import { getCurrentAdmin } from "./_lib/admin";
import { AdminProvider } from "./_components/AdminProvider";

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
  return <AdminProvider admin={admin}>{children}</AdminProvider>;
}
