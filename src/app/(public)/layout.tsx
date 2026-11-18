import type { ReactNode } from "react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Public site chrome: Navbar + Footer wrap every public page.
 * Dashboard routes live outside this group, so they render
 * without the navbar/footer (sidebar-only layout).
 */
export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
