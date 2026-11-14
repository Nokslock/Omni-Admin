"use client";

import { ProBadge } from "../_components/ProBadge";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type User,
  type UserStatus,
  type UserRole,
  userStatusMeta,
  roleMeta,
  reliabilityColor,
} from "../_lib/users";
import { FilterDropdown } from "../_components/FilterDropdown";
import { toast } from "../_components/toast";
import { AddAdminModal } from "./AddAdminModal";
import { BroadcastModal } from "./BroadcastModal";
import { setUserStatus, deleteUser } from "./actions";
import { UserActivityPanel } from "./UserActivityPanel";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import { EmptyState, GUTTER, PageHeader, Panel, SearchField, StatGrid, StatTile, StatusPill, TD, TH, TR, btnSm } from "../_components/ui";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "clear", label: "Clear" },
  { value: "investigation", label: "Under Investigation" },
  { value: "suspended", label: "Suspended" },
];

const roleOptions = [
  { value: "all", label: "All roles" },
  { value: "admin", label: "Admins" },
  { value: "moderator", label: "Moderators" },
  { value: "user", label: "Users" },
];

const reliabilityOptions = [
  { value: "any", label: "Any" },
  { value: "high", label: "High (≥80%)" },
  { value: "medium", label: "Medium (60–79%)" },
  { value: "low", label: "Low (<60%)" },
];

const joinedOptions = [
  { value: "any", label: "Anytime" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "This year" },
];

type SortKey = "reports" | "reliability" | "joined" | "name";
const sortOptions: { value: SortKey; label: string }[] = [
  { value: "reports", label: "Total reports ↓" },
  { value: "reliability", label: "Reliability ↓" },
  { value: "joined", label: "Most recently joined" },
  { value: "name", label: "Name (A–Z)" },
];

export function UsersTable({
  users,
  currentEmail,
  currentRole,
  initialRole,
}: {
  users: User[];
  currentEmail: string | null;
  currentRole: string | null;
  initialRole?: string;
}) {
  // Pre-fill from global search (?q=…), e.g. when jumping to a specific reporter.
  const [query, setQuery] = useState(useSearchParams().get("q") ?? "");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState(
    roleOptions.some((o) => o.value === initialRole) ? initialRole! : "all",
  );
  const [reliability, setReliability] = useState("any");
  const [joined, setJoined] = useState(initialRole ? "any" : "7d");
  const [sort, setSort] = useState<SortKey>("joined");
  // Capture "now" once per mount so the filter stays pure across re-renders.
  const [nowMs] = useState(() => Date.now());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const joinedCutoff: Record<string, number> = {
      "7d": 7, "30d": 30, "90d": 90, "1y": 365,
    };
    const cutoffDays = joinedCutoff[joined] ?? null;
    const cutoffDate = cutoffDays
      ? new Date(nowMs - cutoffDays * 86_400_000).toISOString().slice(0, 10)
      : null;

    let list = users.filter((u) => {
      if (q) {
        const hay = `${u.name} ${u.email} ${u.phone ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (status !== "all" && u.status !== (status as UserStatus)) return false;
      if (role !== "all" && u.role !== (role as UserRole)) return false;
      if (reliability === "high" && u.reliability < 80) return false;
      if (reliability === "medium" && (u.reliability < 60 || u.reliability >= 80)) return false;
      if (reliability === "low" && u.reliability >= 60) return false;
      if (cutoffDate && u.joinedDate < cutoffDate) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "reports": return b.reports - a.reports;
        case "reliability": return b.reliability - a.reliability;
        case "joined": return b.joinedDate.localeCompare(a.joinedDate);
        case "name": return a.name.localeCompare(b.name);
      }
    });
    return list;
  }, [users, query, status, role, reliability, joined, sort, nowMs]);

  const stats = useMemo<{ label: string; value: string; sub?: string; color?: string }[]>(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "admin").length;
    const moderators = users.filter((u) => u.role === "moderator").length;
    const suspended = users.filter((u) => u.status === "suspended").length;
    const avgReliability = total
      ? Math.round((users.reduce((sum, u) => sum + u.reliability, 0) / total) * 10) / 10
      : 0;
    const pct = (n: number) => (total ? `${Math.round((n / total) * 100)}%` : "0%");
    return [
      { label: "Total reporters", value: total.toLocaleString(), color: "var(--info)" },
      { label: "Admins", value: admins.toLocaleString(), sub: pct(admins), color: roleMeta.admin.color },
      { label: "Moderators", value: moderators.toLocaleString(), sub: pct(moderators), color: roleMeta.moderator.color },
      { label: "Suspended", value: suspended.toLocaleString(), sub: pct(suspended), color: "var(--danger)" },
      { label: "Avg reliability", value: `${avgReliability}%`, color: "var(--ok)" },
    ];
  }, [users]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Users"
        description={
          <>
            Everyone with a Kasala account. Showing{" "}
            <span className="font-semibold text-fg">{filtered.length}</span> of {users.length}.
          </>
        }
        actions={
          <>
            <BroadcastModal />
            {currentRole === "admin" && <AddAdminModal />}
          </>
        }
      >
        <StatGrid cols={5}>
          {stats.map((s) => (
            <StatTile key={s.label} label={s.label} value={s.value} sub={s.sub && `${s.sub} of total`} color={s.color} />
          ))}
        </StatGrid>
      </PageHeader>

      <div className={`flex min-h-0 flex-1 flex-col pb-6 ${GUTTER}`}>
      <Panel className="flex min-h-[440px] flex-1 flex-col overflow-hidden">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-border px-4 py-3">
        <SearchField value={query} onChange={setQuery} placeholder="Search name, email, phone…" />
        <FilterDropdown label="Status" value={status} options={statusOptions} onChange={setStatus} />
        <FilterDropdown label="Role" value={role} options={roleOptions} onChange={setRole} />
        <FilterDropdown label="Reliability" value={reliability} options={reliabilityOptions} onChange={setReliability} />
        <FilterDropdown label="Joined" value={joined} options={joinedOptions} onChange={setJoined} />
        <div className="ml-auto">
          <FilterDropdown
            label="Sort"
            value={sort}
            options={sortOptions}
            onChange={(v) => setSort(v as SortKey)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className={TH}>User</th>
              <th className={TH}>Phone</th>
              <th className={TH}>Joined</th>
              <th className={TH}>Reports · Reliability</th>
              <th className={TH}>Status</th>
              <th className={`${TH} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    title="No users match"
                    hint={joined !== "any" ? "The Joined filter is on. Set it to Anytime to see older accounts." : "Try a different search or filter."}
                  />
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  isSelf={!!currentEmail && u.email === currentEmail}
                  viewerRole={currentRole}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-5 py-3 text-xs text-fg-muted">
        <span className="font-semibold text-fg">{filtered.length}</span> of {users.length} users
      </div>
      </Panel>
      </div>
    </div>
  );
}

function UserRow({ user, isSelf, viewerRole }: { user: User; isSelf: boolean; viewerRole: string | null }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const meta = userStatusMeta[user.status];
  const role = roleMeta[user.role];
  const reliColor = reliabilityColor(user.reliability);
  const initials = user.name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  const isSuspended = user.status === "suspended";
  const isPrivilegedTarget = user.role === "admin" || user.role === "moderator";
  const canDelete = viewerRole === "admin" && !isSelf;
  const canChangeStatus = !isSelf && !(viewerRole === "moderator" && isPrivilegedTarget);

  async function toggleStatus() {
    setConfirmSuspend(false);
    setPending(true);
    const res = await setUserStatus(user.id, isSuspended ? "clear" : "suspended");
    setPending(false);
    if ("ok" in res) {
      toast(
        isSuspended
          ? `${user.name} reinstated. They can sign in again.`
          : `${user.name} suspended and signed out.`,
        "success",
      );
      router.refresh();
    } else {
      toast(res.error, "error");
    }
  }

  async function confirmRemove() {
    setDeleting(true);
    const res = await deleteUser(user.id);
    if ("ok" in res) {
      setConfirmDelete(false);
      toast(
        `${user.name}'s account is deactivated and will be erased in 30 days.`,
        "success",
      );
      router.refresh();
    } else {
      setDeleting(false);
      setConfirmDelete(false);
      toast(res.error, "error");
    }
  }

  return (
    <tr className={TR}>
      <td className={TD}>
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ background: user.avatarColor }}
          >
            {initials}
          </span>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-fg">{user.name}</span>
              {user.pro && <ProBadge />}
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  color: role.color,
                  borderColor: `color-mix(in oklab, ${role.color} 28%, transparent)`,
                  background: `color-mix(in oklab, ${role.color} 12%, transparent)`,
                  borderWidth: 1,
                }}
              >
                {role.label}
              </span>
            </div>
            <div className="mt-0.5 text-xs text-fg-muted">{user.email}</div>
          </div>
        </div>
      </td>
      <td className={`${TD} whitespace-nowrap tabular-nums text-fg`}>
        {user.phone ? (
          <a href={`tel:${user.phone}`} className="hover:underline">{user.phone}</a>
        ) : (
          <span className="text-fg-subtle">—</span>
        )}
      </td>
      <td className={`${TD} whitespace-nowrap text-fg-muted`}>{user.joined}</td>
      <td className={TD}>
        <div className="flex items-center gap-3">
          <span className="w-8 text-right font-medium tabular-nums text-fg">{user.reports}</span>
          <div className="relative h-1.5 w-32 overflow-hidden rounded-full bg-bg-elev">
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${user.reliability}%`, background: reliColor }}
            />
          </div>
          <span className="w-10 tabular-nums text-fg-muted">{user.reliability}%</span>
        </div>
      </td>
      <td className={TD}>
        <StatusPill color={meta.color} label={meta.label} />
      </td>
      <td className={`${TD} text-right`}>
        <div className="inline-flex items-center gap-2">
          <button
            onClick={() => setActivityOpen(true)}
            className={btnSm.ghost}
          >
            View activity
          </button>
          {activityOpen && (
            <UserActivityPanel user={user} onClose={() => setActivityOpen(false)} />
          )}
          {canChangeStatus && (
            <button
              onClick={() => (isSuspended ? toggleStatus() : setConfirmSuspend(true))}
              disabled={pending}
              className={isSuspended ? btnSm.ok : btnSm.danger}
            >
              {pending ? "…" : isSuspended ? "Reinstate" : "Suspend"}
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              aria-label={`Delete ${user.name}`}
              title="Delete user"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-fg-muted transition-colors hover:border-danger/40 hover:bg-danger/10 hover:text-danger"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
        <ConfirmDialog
          open={confirmSuspend}
          title={`Suspend ${user.name}?`}
          message={`They're signed out everywhere, stop getting alerts, and can't sign in again until you reinstate them. The app tells them to contact support.`}
          confirmLabel="Suspend"
          destructive
          busy={pending}
          onConfirm={toggleStatus}
          onCancel={() => setConfirmSuspend(false)}
        />
        <ConfirmDialog
          open={confirmDelete}
          title={`Delete ${user.name}?`}
          message={`${user.name} (${user.email}) is deactivated now: signed out everywhere${isPrivilegedTarget ? ", including the portal" : ""}, with no alerts. They can restore it by signing in within 30 days; after that it's erased automatically. You can also restore it from Deletions.`}
          confirmLabel="Delete user"
          destructive
          busy={deleting}
          onConfirm={confirmRemove}
          onCancel={() => setConfirmDelete(false)}
        />
      </td>
    </tr>
  );
}
