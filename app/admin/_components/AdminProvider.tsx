"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CurrentAdmin } from "../_lib/admin";

const AdminContext = createContext<CurrentAdmin | null>(null);

export function AdminProvider({
  admin,
  children,
}: {
  admin: CurrentAdmin | null;
  children: ReactNode;
}) {
  return <AdminContext.Provider value={admin}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  return useContext(AdminContext);
}
