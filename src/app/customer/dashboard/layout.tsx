import type { ReactNode } from "react";

import DashboardSidebar from "@/components/DashboardSidebar";

export default function CustomerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardSidebar role="customer">{children}</DashboardSidebar>;
}
