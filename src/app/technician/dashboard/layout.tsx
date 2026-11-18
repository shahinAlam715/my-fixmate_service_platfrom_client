import type { ReactNode } from "react";

import DashboardSidebar from "@/components/DashboardSidebar";

export default function TechnicianDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardSidebar role="technician">{children}</DashboardSidebar>;
}
