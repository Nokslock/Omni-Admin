import type { Metadata } from "next";
import { getCurrentAdmin } from "../_lib/admin";
import { roleMeta } from "../_lib/users";
import type { UserRole } from "../_lib/users";
import { PageHeader, GUTTER } from "../_components/ui";
import { ChangePasswordModal } from "./ChangePasswordModal";

export const metadata: Metadata = {
  title: "Profile — Kasala Admin",
  description: "Your Kasala admin account.",
};

export default async function ProfilePage() {
  const admin = await getCurrentAdmin();
  const role = admin ? roleMeta[admin.role as UserRole] : undefined;

  return (
    <div className="flex min-h-full flex-col bg-bg text-fg">
      <PageHeader title="Profile" description="Your Kasala admin account." />
      <main className={`flex-1 pb-8 ${GUTTER}`}>
        <div className="w-full max-w-2xl">
          <div className="overflow-hidden rounded-2xl border border-border bg-bg-card">
            <div className="glow-soft h-20 border-b border-border" aria-hidden />
            <div className="-mt-9 px-6 pb-6">
            <div className="flex flex-wrap items-end gap-4">
              <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-danger text-2xl font-semibold text-white ring-4 ring-bg-card">
                {admin?.initials || "—"}
              </span>
              <div>
                <div className="text-xl font-semibold">{admin?.name || "Account"}</div>
                <div className="text-sm text-fg-muted">{admin?.email || ""}</div>
              </div>
              {role && (
                <span
                  className="mb-1 ml-auto inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide"
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

            <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
              <div>
                <div className="text-sm font-medium text-fg">Password</div>
                <div className="text-xs text-fg-muted">Update the password you use to sign in.</div>
              </div>
              <ChangePasswordModal />
            </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-card px-4 py-3.5">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-fg-subtle">{label}</dt>
      <dd className="mt-1 text-sm text-fg">{value}</dd>
    </div>
  );
}
