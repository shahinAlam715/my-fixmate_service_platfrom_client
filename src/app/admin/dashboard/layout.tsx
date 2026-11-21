import type { ReactNode } from "react";

import DashboardSidebar from "@/components/DashboardSidebar";
import { requerRole } from "@/lib/core";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requerRole("admin")
  return <DashboardSidebar role="admin">{children}</DashboardSidebar>;
}
