import type { Metadata } from "next";
import { AdminNav } from "../_components/AdminNav";
import { getCurrentAdmin } from "../_lib/admin";
import { roleMeta } from "../_lib/users";
import type { UserRole } from "../_lib/users";

export const metadata: Metadata = {
  title: "Profile — Omni Admin",
  description: "Your Omni admin account.",
};

export default async function ProfilePage() {
  const admin = await getCurrentAdmin();
  const role = admin ? roleMeta[admin.role as UserRole] : undefined;

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <AdminNav />
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto w-full max-w-2xl">
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-fg-muted">
            <span>Admin</span>
            <span className="text-fg-subtle">›</span>
            <span className="text-fg">Profile</span>
          </nav>
          <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
          <p className="mt-1 text-sm text-fg-muted">Your Omni admin account details.</p>

          <div className="mt-6 rounded-2xl border border-border bg-bg-card p-6">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-info text-xl font-semibold text-white">
                {admin?.initials || "—"}
              </span>
              <div>
                <div className="text-xl font-semibold">{admin?.name || "Account"}</div>
                <div className="text-sm text-fg-muted">{admin?.email || ""}</div>
              </div>
              {role && (
                <span
                  className="ml-auto inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: role.color,
                    borderColor: `color-mix(in oklab, ${role.color} 28%, transparent)`,
                    background: `color-mix(in oklab, ${role.color} 12%, transparent)`,
                  }}
                >
                  {role.label}
                </span>
              )}
            </div>

            <dl className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
              <Field label="Name" value={admin?.name || "—"} />
              <Field label="Email" value={admin?.email || "—"} />
              <Field label="Role" value={role?.label || admin?.role || "—"} />
              <Field label="Access" value="Admin portal" />
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-card px-4 py-3.5">
      <dt className="text-[11px] uppercase tracking-wider text-fg-subtle">{label}</dt>
      <dd className="mt-1 text-sm text-fg">{value}</dd>
    </div>
  );
}
