import { getCurrentAdmin } from "./_lib/admin";
import { AdminProvider } from "./_components/AdminProvider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  return <AdminProvider admin={admin}>{children}</AdminProvider>;
}
