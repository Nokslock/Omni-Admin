"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type User,
  type UserStatus,
  type UserRole,
  userStatusMeta,
  roleMeta,
  reliabilityColor,
} from "../_lib/users";
import { FilterDropdown } from "../_components/FilterDropdown";
import { AddAdminModal } from "./AddAdminModal";
import { setUserStatus } from "./actions";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "clear", label: "Clear" },
  { value: "investigation", label: "Under Investigation" },
  { value: "suspended", label: "Suspended" },
];

const roleOptions = [
  { value: "all", label: "All roles" },
  { value: "admin", label: "Admins" },
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

export function UsersTable({ users }: { users: User[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");
  const [reliability, setReliability] = useState("any");
  const [joined, setJoined] = useState("any");
  const [sort, setSort] = useState<SortKey>("reports");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = users.filter((u) => {
      if (q) {
        const hay = `${u.name} ${u.email}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (status !== "all" && u.status !== (status as UserStatus)) return false;
      if (role !== "all" && u.role !== (role as UserRole)) return false;
      if (reliability === "high" && u.reliability < 80) return false;
      if (reliability === "medium" && (u.reliability < 60 || u.reliability >= 80)) return false;
      if (reliability === "low" && u.reliability >= 60) return false;
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
  }, [users, query, status, role, reliability, sort]);

  const stats = useMemo<{ label: string; value: string; sub?: string }[]>(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "admin").length;
    const suspended = users.filter((u) => u.status === "suspended").length;
    const avgReliability = total
      ? Math.round((users.reduce((sum, u) => sum + u.reliability, 0) / total) * 10) / 10
      : 0;
    const pct = (n: number) => (total ? `${Math.round((n / total) * 100)}%` : "0%");
    return [
      { label: "Total reporters", value: total.toLocaleString() },
      { label: "Admins", value: admins.toLocaleString(), sub: pct(admins) },
      { label: "Suspended", value: suspended.toLocaleString(), sub: pct(suspended) },
      { label: "Avg reliability", value: `${avgReliability}%` },
    ];
  }, [users]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Page header */}
      <div className="border-b border-border bg-bg px-6 pb-5 pt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <nav className="mb-3 flex items-center gap-1.5 text-xs text-fg-muted">
              <span>Admin</span>
              <span className="text-fg-subtle">›</span>
              <span className="text-fg">Users</span>
            </nav>
            <h1 className="text-3xl font-semibold tracking-tight">User Directory</h1>
            <p className="mt-1 text-sm text-fg-muted">
              Mobile reporters · <span className="font-semibold text-fg">{filtered.length}</span> of {users.length} shown
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-bg-card px-4 text-sm font-medium hover:border-border-strong transition-colors">
              <DownloadIcon />
              Export
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-bg-card px-4 text-sm font-medium hover:border-border-strong transition-colors">
              <MailIcon />
              Broadcast
            </button>
            <AddAdminModal />
          </div>
        </div>

        {/* Stat cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-bg-card px-5 py-4">
              <div className="text-xs text-fg-muted">{s.label}</div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-2xl font-semibold tracking-tight">{s.value}</span>
                {s.sub && (
                  <span className="font-mono text-[11px] text-fg-muted">{s.sub} of total</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-bg px-6 py-4">
        <div className="relative w-full max-w-xs">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-fg-subtle">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email…"
            className="h-10 w-full rounded-lg border border-border bg-bg-card pl-9 pr-3 text-sm text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none focus:ring-1 focus:ring-fg-muted/30"
          />
        </div>
        <span className="hidden h-6 w-px bg-border md:block" aria-hidden />
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
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-bg">
            <tr className="text-left text-[10px] uppercase tracking-wider text-fg-subtle">
              <th className="border-b border-border px-6 py-3 font-medium">User</th>
              <th className="border-b border-border py-3 font-medium">Joined</th>
              <th className="border-b border-border py-3 font-medium">Reports · Reliability</th>
              <th className="border-b border-border py-3 font-medium">Status</th>
              <th className="border-b border-border px-6 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-sm text-fg-muted">
                  No users match these filters.
                </td>
              </tr>
            ) : (
              filtered.map((u) => <UserRow key={u.id} user={u} />)
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border bg-bg px-6 py-3 text-xs text-fg-muted">
        <span>{filtered.length} of {users.length} users</span>
        <div className="flex items-center gap-3">
          <button aria-label="Previous page" className="inline-flex h-7 w-7 items-center justify-center rounded border border-border text-fg-muted hover:text-fg disabled:opacity-40" disabled>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <span className="font-mono">
            <span className="text-fg">1</span> <span className="text-fg-subtle">/</span> 1
          </span>
          <button aria-label="Next page" className="inline-flex h-7 w-7 items-center justify-center rounded border border-border text-fg-muted hover:text-fg disabled:opacity-40" disabled>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function UserRow({ user }: { user: User }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const meta = userStatusMeta[user.status];
  const role = roleMeta[user.role];
  const reliColor = reliabilityColor(user.reliability);
  const initials = user.name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  const isSuspended = user.status === "suspended";

  async function toggleStatus() {
    setPending(true);
    const res = await setUserStatus(user.id, isSuspended ? "clear" : "suspended");
    setPending(false);
    if ("ok" in res) {
      router.refresh();
    } else {
      alert(res.error);
    }
  }

  return (
    <tr className="border-b border-border transition-colors hover:bg-bg-elev/40">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
            style={{ background: user.avatarColor }}
          >
            {initials}
          </span>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-fg">{user.name}</span>
              <span
                className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
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
            <div className="text-[11px] text-fg-muted">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="py-4 pr-6 text-fg">{user.joined}</td>
      <td className="py-4 pr-6">
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
      <td className="py-4 pr-6">
        <span
          className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium"
          style={{
            color: meta.color,
            borderColor: `color-mix(in oklab, ${meta.color} 28%, transparent)`,
            background: `color-mix(in oklab, ${meta.color} 10%, transparent)`,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
          {meta.label}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="inline-flex items-center gap-2">
          <button className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium text-fg hover:border-border-strong transition-colors">
            View activity
          </button>
          <button
            onClick={toggleStatus}
            disabled={pending}
            className={`inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium transition-colors disabled:opacity-50 ${
              isSuspended
                ? "border-ok/40 text-ok hover:bg-ok/10"
                : "border-danger/40 text-danger hover:bg-danger/10"
            }`}
          >
            {pending ? "…" : isSuspended ? "Reinstate" : "Suspend"}
          </button>
        </div>
      </td>
    </tr>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
