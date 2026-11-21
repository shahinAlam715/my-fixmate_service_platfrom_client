import type { ReactNode } from "react";

import DashboardSidebar from "@/components/DashboardSidebar";
import { requerRole } from "@/lib/core";

export default async function TechnicianDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requerRole("technician")
  return <DashboardSidebar role="technician">{children}</DashboardSidebar>
  
  ;
}
