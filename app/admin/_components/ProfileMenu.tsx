"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAdmin } from "./AdminProvider";
import { signOut } from "../actions";

export function ProfileMenu() {
  const admin = useAdmin();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-2.5 rounded-md border border-border py-1 pl-1 pr-2.5 text-left hover:border-border-strong transition-colors"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-info text-[11px] font-semibold text-white">
          {admin?.initials || "—"}
        </span>
        <span className="leading-tight">
          <span className="block text-xs font-semibold">{admin?.name || "Account"}</span>
          <span className="block max-w-[150px] truncate text-[10px] text-fg-muted">
            {admin?.email || ""}
          </span>
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`ml-1 text-fg-muted transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-bg-card shadow-xl shadow-black/30"
        >
          <div className="border-b border-border px-3.5 py-3">
            <div className="text-xs font-semibold text-fg">{admin?.name || "Account"}</div>
            <div className="mt-0.5 truncate text-[11px] text-fg-muted">{admin?.email || ""}</div>
          </div>
          <div className="p-1">
            <Link
              href="/admin/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-fg hover:bg-bg-elev transition-colors"
            >
              <UserIcon />
              View profile
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
              >
                <LogoutIcon />
                Logout
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
