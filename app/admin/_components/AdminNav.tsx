"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "../../components/ThemeToggle";
import { ProfileMenu } from "./ProfileMenu";
import { NotificationsBell } from "./NotificationsBell";

const tabs = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  { href: "/admin/incidents", label: "Incidents", icon: <IncidentsIcon /> },
  { href: "/admin/users", label: "Users", icon: <UsersIcon /> },
  { href: "/admin/missing", label: "Missing", icon: <MissingIcon /> },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b border-border bg-bg-card/95 px-5 backdrop-blur">
      <Link href="/admin/dashboard" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <LogoMark />
        <span>Omni</span>
        <span className="ml-1.5 text-xs font-normal text-fg-muted">Admin</span>
      </Link>

      <span className="mx-5 h-6 w-px bg-border" aria-hidden />

      <nav className="flex items-center gap-1">
        {tabs.map((t) => {
          const active = pathname?.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`inline-flex h-10 items-center gap-2 rounded-md px-3.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-bg-elev text-fg shadow-[inset_0_0_0_1px_var(--border)]"
                  : "text-fg-muted hover:text-fg hover:bg-bg-elev/50"
              }`}
            >
              {t.icon}
              {t.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-6 flex flex-1 justify-center">
        <div className="relative w-full max-w-xl">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-fg-subtle">
            <SearchIcon />
          </span>
          <input
            type="search"
            placeholder="Search incidents, users, locations…"
            className="h-10 w-full rounded-lg border border-border bg-bg-elev pl-9 pr-14 text-sm text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none focus:ring-1 focus:ring-fg-muted/30"
          />
          <kbd className="pointer-events-none absolute inset-y-0 right-2 my-auto flex h-5 items-center rounded border border-border bg-bg-card px-1.5 font-mono text-[10px] text-fg-muted">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="inline-flex h-8 items-center gap-2 rounded-md border border-ok/30 bg-ok/10 px-2.5">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-ok animate-ping-slow" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ok" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ok">Live</span>
        </div>

        <ThemeToggle />

        <NotificationsBell />

        <ProfileMenu />
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <span className="relative inline-flex h-5 w-5 items-center justify-center">
      <span className="absolute inset-0 rounded-full border border-fg" />
      <span className="h-1.5 w-1.5 rounded-full bg-fg" />
    </span>
  );
}
function DashboardIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>; }
function IncidentsIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function UsersIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function MissingIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="8" r="4"/><path d="M4 22a8 8 0 0 1 12-7"/><line x1="17" y1="17" x2="22" y2="22"/><line x1="22" y1="17" x2="17" y2="22"/></svg>; }
function SearchIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
