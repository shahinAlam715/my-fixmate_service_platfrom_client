"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { cn } from "cn";

import Logo from "@/components/Logo";
import { authClient, useSession } from "@/lib/auth-client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type DashboardRole = "customer" | "technician" | "admin";

/** Sidebar nav per role — add/remove items here only. */
const NAV_ITEMS: Record<DashboardRole, { label: string; slug: string }[]> = {
  customer: [
    { label: "Overview", slug: "overview" },
    { label: "My Bookings", slug: "my-bookings" },
    { label: "Payments", slug: "payments" },
    { label: "Update Profile", slug: "update-profile" },
  ],
  technician: [
    { label: "Overview", slug: "overview" },
    { label: "Add Service", slug: "add-service" },
    { label: "My Services", slug: "my-services" },
    { label: "Requests", slug: "requests" },
    { label: "Update Profile", slug: "update-profile" },
  ],
  admin: [
    { label: "Overview", slug: "overview" },
    { label: "Users", slug: "users" },
    { label: "Services", slug: "services" },
    { label: "Bookings", slug: "bookings" },
    { label: "Transactions", slug: "transactions" },
    { label: "Update Profile", slug: "update-profile" },
  ],
};

const BASE_PATH: Record<DashboardRole, string> = {
  customer: "/customer/dashboard",
  technician: "/technician/dashboard",
  admin: "/admin/dashboard",
};

/** Role badge styling tuned for the dark sidebar background. */
const ROLE_META: Record<
  DashboardRole,
  { label: string; badgeClassName: string }
> = {
  customer: {
    label: "Customer",
    badgeClassName:
      "bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/30",
  },
  technician: {
    label: "Technician",
    badgeClassName:
      "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30",
  },
  admin: {
    label: "Admin",
    badgeClassName:
      "bg-purple-500/15 text-purple-300 ring-1 ring-purple-400/30",
  },
};

export default function DashboardSidebar({
  role,
  children,
}: {
  role: DashboardRole;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();

  // Real session user when signed in; graceful fallbacks otherwise.
  const sessionUser = session.data?.user;
  const userName = sessionUser?.name?.trim() || "Guest User";
  const userImage = sessionUser?.image || undefined;

  const meta = ROLE_META[role];
  const basePath = BASE_PATH[role];

  const handleSignOut = async () => {
    try {
      const { error } = await authClient.signOut();

      if (error) {
        console.error("Sign out error:", error);
        return;
      }

      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full shrink-0 bg-[#13233f] md:sticky md:top-0 md:h-screen md:w-64 md:overflow-y-auto">
        {/* Brand + sign out */}
        <div className="flex items-center justify-between gap-2 px-4 pt-5 pb-4">
          <Logo onDark />
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleSignOut}
            className="shrink-0 border-white/15 bg-transparent text-blue-100/90 hover:bg-white/10 hover:text-white"
          >
            <LogOut />
            Sign Out
          </Button>
        </div>

        {/* User: avatar (default when no image) → name → role badge */}
        <div className="flex flex-col items-center gap-2 border-b border-white/10 px-4 pb-5">
          <Avatar className="size-14 ring-2 ring-white/15">
            {userImage ? (
              <AvatarImage
                src={userImage}
                alt={userName}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="bg-white/10 text-blue-100">
              <UserRound className="size-6" />
            </AvatarFallback>
          </Avatar>
          <p className="max-w-full truncate px-2 text-sm font-semibold text-white">
            {userName}
          </p>
          <Badge
            className={cn("border border-transparent", meta.badgeClassName)}
          >
            {meta.label}
          </Badge>
        </div>

        {/* Role nav */}
        <nav
          className="flex flex-col gap-1 p-4"
          aria-label={`${meta.label} dashboard`}
        >
          {NAV_ITEMS[role].map((item) => {
            const href = `${basePath}/${item.slug}`;
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={item.slug}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-orange-600 text-white"
                    : "text-blue-100/85 hover:bg-white/10 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Page content */}
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
