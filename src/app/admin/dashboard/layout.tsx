import type { ReactNode } from "react";

import DashboardSidebar from "@/components/DashboardSidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardSidebar role="admin">{children}</DashboardSidebar>;
}
