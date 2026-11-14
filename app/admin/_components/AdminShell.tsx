"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ProfileMenu } from "./ProfileMenu";
import { NotificationsBell } from "./NotificationsBell";
import { GlobalSearch } from "./GlobalSearch";
import type { NavCounts } from "../_lib/nav-counts.data";

type NavLeaf = {
  label: string;
  href: string;
  badge?: keyof NavCounts;
};

type NavGroup = {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
  /** Count shown on the link itself (for groups without sub-links). */
  badge?: keyof NavCounts;
  children?: NavLeaf[];
};

type NavSection = { label: string; groups: NavGroup[] };

const SECTIONS: NavSection[] = [
  {
    label: "Overview",
    groups: [
      { id: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: <DashboardIcon /> },
    ],
  },
  {
    label: "Operations",
    groups: [
      {
        id: "incidents",
        label: "Incidents",
        href: "/admin/incidents",
        icon: <IncidentsIcon />,
        badge: "unverified",
      },
      {
        id: "missing",
        label: "Missing persons",
        href: "/admin/missing",
        icon: <MissingIcon />,
      },
    ],
  },
  {
    label: "Community",
    groups: [
      {
        id: "users",
        label: "Users",
        href: "/admin/users",
        icon: <UsersIcon />,
        children: [
          { label: "All users", href: "/admin/users" },
          { label: "Deletion requests", href: "/admin/deletion-requests", badge: "deletions" },
        ],
      },
      {
        id: "moderation",
        label: "Moderation",
        href: "/admin/moderation",
        icon: <ModerationIcon />,
        badge: "reportedComments",
      },
      {
        id: "broadcasts",
        label: "Ads & Broadcasts",
        href: "/admin/broadcasts",
        icon: <BroadcastIcon />,
        children: [
          { label: "Broadcasts", href: "/admin/broadcasts" },
          { label: "Ads", href: "/admin/ads", badge: "pendingAds" },
        ],
      },
    ],
  },
  {
    label: "Growth",
    groups: [
      { id: "referrals", label: "Referrals", href: "/admin/referrals", icon: <ReferralsIcon /> },
      { id: "gifts", label: "Gifts", href: "/admin/gifts", icon: <GiftIcon /> },
      {
        id: "payouts",
        label: "Payouts",
        href: "/admin/payouts",
        icon: <PayoutIcon />,
        badge: "pendingPayouts",
      },
    ],
  },
];

const COLLAPSE_KEY = "kasala-admin-sidebar";

/** Breadcrumb trail for the current path: [section, page]. */
function crumbsFor(pathname: string): [string, string] {
  if (pathname.startsWith("/admin/incidents/")) return ["Incidents", "Incident detail"];
  if (pathname.startsWith("/admin/deletion-requests")) return ["Community", "Deletion requests"];
  if (pathname.startsWith("/admin/ads")) return ["Ads & Broadcasts", "Ads"];
  if (pathname.startsWith("/admin/broadcasts")) return ["Ads & Broadcasts", "Broadcasts"];
  if (pathname.startsWith("/admin/profile")) return ["Account", "Settings"];
  for (const section of SECTIONS) {
    for (const g of section.groups) {
      if (pathname.startsWith(g.href)) return [section.label, g.label];
    }
  }
  return ["Overview", "Dashboard"];
}

export function AdminShell({
  counts,
  children,
}: {
  counts: NavCounts;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore persisted preference after hydration
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {}
  }, []);

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  }

  // The login screen renders without the admin chrome.
  if (pathname === "/admin/login") return <>{children}</>;

  const [section, page] = crumbsFor(pathname);

  return (
    <div className="flex h-dvh overflow-hidden bg-bg text-fg">
      <aside
        className={`flex shrink-0 flex-col border-r border-border bg-bg-card transition-[width] duration-200 ${
          collapsed ? "w-[72px]" : "w-[264px]"
        }`}
      >
        <div
          className={`flex h-16 shrink-0 items-center border-b border-border ${
            collapsed ? "justify-center" : "gap-2.5 px-5"
          }`}
        >
          <Link href="/admin/dashboard" className="flex items-center gap-2.5" aria-label="Kasala Admin">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" className="h-7 w-7 rounded-full" />
            {!collapsed && (
              <span className="flex items-baseline gap-1.5">
                <span className="text-base font-semibold tracking-tight">Kasala</span>
                <span className="text-sm text-fg-muted">Admin</span>
              </span>
            )}
          </Link>
        </div>

        <Suspense fallback={<div className="flex-1" />}>
          <SidebarNav collapsed={collapsed} counts={counts} pathname={pathname} />
        </Suspense>

        <div className={`shrink-0 border-t border-border py-3 ${collapsed ? "px-3" : "px-2.5"}`}>
          <SidebarButton
            collapsed={collapsed}
            href="/admin/profile"
            active={pathname.startsWith("/admin/profile")}
            icon={<SettingsIcon />}
            label="Settings"
          />
          <button
            type="button"
            onClick={toggleCollapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`mt-0.5 flex h-10 w-full items-center rounded-lg text-sm text-fg-muted transition-colors hover:bg-bg-elev hover:text-fg ${
              collapsed ? "justify-center" : "gap-3 px-3"
            }`}
          >
            <CollapseIcon flipped={collapsed} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="z-50 flex h-16 shrink-0 items-center gap-6 border-b border-border bg-bg-card/95 px-6 backdrop-blur">
          <nav aria-label="Breadcrumb" className="flex shrink-0 items-center gap-2 text-sm">
            <span className="text-fg-muted">{section}</span>
            <span className="text-fg-subtle">/</span>
            <span className="font-semibold text-fg">{page}</span>
          </nav>

          <div className="flex min-w-0 flex-1 justify-center">
            <GlobalSearch />
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {/* Only where the page really re-fetches by itself. */}
            {(pathname.startsWith("/admin/dashboard") || pathname === "/admin/incidents") && (
              <div
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-ok/30 bg-ok/10 px-3"
                title="This page checks for new reports by itself"
              >
                <span className="relative inline-flex h-1.5 w-1.5">
                  <span className="absolute inset-0 rounded-full bg-ok animate-ping-slow" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ok" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ok">Live</span>
              </div>
            )}
            <NotificationsBell />
            <ProfileMenu />
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}

function SidebarNav({
  collapsed,
  counts,
  pathname,
}: {
  collapsed: boolean;
  counts: NavCounts;
  pathname: string;
}) {
  const params = useSearchParams();
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  /** A child link is active when its path matches and every query param it sets matches. */
  function leafActive(href: string): boolean {
    const url = new URL(href, "http://x");
    if (pathname !== url.pathname) return false;
    // Compare filter params exactly; a search query (?q=) doesn't change which view is active.
    const have = new URLSearchParams(params.toString());
    have.delete("q");
    const want = url.searchParams;
    if (want.size !== have.size) return false;
    return Array.from(want.entries()).every(([k, v]) => have.get(k) === v);
  }

  return (
    <nav className={`flex-1 overflow-y-auto py-4 ${collapsed ? "px-3" : "px-2.5"}`}>
      {SECTIONS.map((section, si) => (
        <div key={section.label} className={si > 0 ? "mt-6" : ""}>
          {collapsed ? (
            si > 0 && <div className="mx-auto mb-3 h-px w-6 bg-border" aria-hidden />
          ) : (
            <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
              {section.label}
            </div>
          )}

          <ul className="space-y-0.5">
            {section.groups.map((g) => {
              const groupActive =
                pathname.startsWith(g.href) ||
                (g.children?.some((c) => pathname.startsWith(c.href.split("?")[0])) ?? false);

              if (!g.children || collapsed) {
                return (
                  <li key={g.id}>
                    <SidebarButton
                      collapsed={collapsed}
                      href={g.href}
                      active={groupActive}
                      icon={g.icon}
                      label={g.label}
                      count={g.badge ? counts[g.badge] : 0}
                    />
                  </li>
                );
              }

              const open = !closed[g.id];
              return (
                <li key={g.id}>
                  <button
                    type="button"
                    onClick={() => setClosed((c) => ({ ...c, [g.id]: open }))}
                    aria-expanded={open}
                    className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors hover:bg-bg-elev ${
                      groupActive ? "text-fg" : "text-fg-muted hover:text-fg"
                    }`}
                  >
                    <span className="shrink-0">{g.icon}</span>
                    <span className="flex-1 text-left">{g.label}</span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`text-fg-subtle transition-transform ${open ? "" : "rotate-180"}`}
                      aria-hidden
                    >
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>

                  {open && (
                    <ul className="ml-[22px] mt-0.5 space-y-0.5 border-l border-border pl-3">
                      {g.children.map((c) => {
                        const active = leafActive(c.href);
                        const count = c.badge ? counts[c.badge] : 0;
                        return (
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              className={`flex h-9 items-center rounded-md px-3 text-[13px] transition-colors ${
                                active
                                  ? "bg-bg-elev font-medium text-fg"
                                  : "text-fg-muted hover:bg-bg-elev/60 hover:text-fg"
                              }`}
                            >
                              <span className="flex-1">{c.label}</span>
                              {count > 0 && (
                                <span className="font-mono text-[11px] font-semibold text-warn">
                                  {count > 99 ? "99+" : count}
                                </span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarButton({
  collapsed,
  href,
  active,
  icon,
  label,
  count = 0,
}: {
  collapsed: boolean;
  href: string;
  active: boolean;
  icon: ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      className={`flex h-10 items-center rounded-lg text-sm font-medium transition-colors ${
        collapsed ? "justify-center" : "gap-3 px-3"
      } ${active ? "bg-bg-elev text-fg" : "text-fg-muted hover:bg-bg-elev hover:text-fg"}`}
    >
      <span className="relative shrink-0">
        {icon}
        {collapsed && count > 0 && (
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-warn" aria-hidden />
        )}
      </span>
      {!collapsed && <span className="flex-1">{label}</span>}
      {!collapsed && count > 0 && (
        <span className="font-mono text-[11px] font-semibold text-warn">{count > 99 ? "99+" : count}</span>
      )}
    </Link>
  );
}

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function DashboardIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function IncidentsIcon() {
  return (
    <svg {...iconProps}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg {...iconProps}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function MissingIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="10" cy="8" r="4" />
      <path d="M3 21a7 7 0 0 1 11-5.7" />
      <line x1="17" y1="17" x2="22" y2="22" />
      <line x1="22" y1="17" x2="17" y2="22" />
    </svg>
  );
}
function BroadcastIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 11l18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}
function ModerationIcon() {
  return (
    <svg {...iconProps}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="12" y1="8" x2="12" y2="11" />
      <line x1="12" y1="14" x2="12.01" y2="14" />
    </svg>
  );
}

function ReferralsIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M19 8v6M16 11h6" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8M12 8v13" />
      <path d="M12 8S10.5 3 7.5 4.5 9 8 12 8zM12 8s1.5-5 4.5-3.5S15 8 12 8z" />
    </svg>
  );
}

function PayoutIcon() {
  return (
    <svg {...iconProps}>
      <rect x="2" y="6" width="20" height="13" rx="2" />
      <circle cx="12" cy="12.5" r="2.5" />
      <path d="M6 10v.01M18 15v.01" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function CollapseIcon({ flipped }: { flipped: boolean }) {
  return (
    <svg {...iconProps} className={flipped ? "rotate-180" : ""}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <polyline points="16 15 13 12 16 9" />
    </svg>
  );
}
