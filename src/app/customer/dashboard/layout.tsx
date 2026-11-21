import type { ReactNode } from "react";

import DashboardSidebar from "@/components/DashboardSidebar";
import { requerRole } from "@/lib/core";

export default async function CustomerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requerRole("customer")
  return <DashboardSidebar role="customer">{children}</DashboardSidebar>;
}
