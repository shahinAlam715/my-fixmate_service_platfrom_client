
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";

import { cn } from "cn";

import Logo from "@/components/Logo";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { authClient, useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";

type Role = "customer" | "technician" | "admin";

interface AuthUser {
  name: string;
  email: string;
  image?: string | null;
  role?: Role;
}

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "How It Works", href: "/about" },
];

const DASHBOARD_ROUTES: Record<Role, string> = {
  customer: "/customer/dashboard",
  technician: "/technician/dashboard",
  admin: "/admin/dashboard",
};

const ROLE_BADGES: Record<
  Role,
  { label: string; className: string }
> = {
  customer: {
    label: "Customer",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  technician: {
    label: "Technician",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  admin: {
    label: "Admin",
    className: "border-purple-200 bg-purple-50 text-purple-700",
  },
};

function initials(name: string) {
  return (
    name
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  );
}

function NavLink({
  href,
  label,
  active,
  className,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md text-sm font-medium transition-colors",
        active
          ? "text-orange-600"
          : "text-gray-600 hover:text-orange-600",
        className
      )}
    >
      {label}
    </Link>
  );
}

function UserAvatar({
  user,
  className,
}: {
  user: AuthUser;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      <AvatarImage
        src={user.image || undefined}
        alt={user.name}
        className="object-cover"
      />

      <AvatarFallback className="bg-orange-600 font-semibold text-white">
        {initials(user.name)}
      </AvatarFallback>
    </Avatar>
  );
}

function UserMenu({
  user,
}: {
  user: AuthUser;
}) {
  const router = useRouter();

  const role: Role =
    user.role === "technician" || user.role === "admin"
      ? user.role
      : "customer";

  const badge = ROLE_BADGES[role];

 const handleSignOut = async () => {
  try {
    const { error } = await authClient.signOut();

    if (error) {
      toast.error(error.message || "Sign out failed!");
      return;
    }

    toast.success("Sign Out Successful!");

    // Full page reload after sign out
    window.location.replace("/");
  } catch (error) {
    console.error("Sign out error:", error);
    toast.error("Something went wrong!");
  }
};

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open user menu"
        className="flex rounded-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        <UserAvatar user={user} />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        {/* User Information */}
        <div className="flex items-center gap-3 px-2 py-2">
          <UserAvatar user={user} />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {user.name}
            </p>

            <p className="truncate text-xs text-gray-500">
              {user.email}
            </p>

            <Badge className={cn("mt-1 w-fit", badge.className)}>
              {badge.label}
            </Badge>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Dashboard */}
        <DropdownMenuItem
          render={<Link href={DASHBOARD_ROUTES[role]} />}
        >
          <LayoutDashboard className="size-4" />
          Dashboard
        </DropdownMenuItem>

        {/* Update Profile */}
        <DropdownMenuItem
          render={<Link href="/profile" />}
        >
          <UserRound className="size-4" />
          Update Profile
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuItem
          variant="destructive"
          onClick={handleSignOut}
        >
          <LogOut className="size-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter()

  const [mobileOpen, setMobileOpen] = useState(false);

  // Get real user session from Better Auth
  const session = useSession();

  const authUser = session.data?.user as AuthUser | undefined;

  const isLoggedIn = !!authUser;

  const user: AuthUser | null = authUser
    ? {
        ...authUser,
        name: authUser.name || "User",
        email: authUser.email || "",
      }
    : null;

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  // Desktop authentication section
  const authDesktop = (
    <>
      {isLoggedIn && user ? (
        <UserMenu user={user} />
      ) : (
        <>
          <Link href="/sign-in">
            <Button variant="outline">
              Sign In
            </Button>
          </Link>

          <Link href="/sign-up">
            <Button className="bg-orange-600 text-white hover:bg-orange-700">
              Sign Up
            </Button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">

        {/* Logo */}
        <div className="flex items-center gap-8">
          <Logo />
        </div>

        {/* Desktop Navigation */}
        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              active={isActive(link.href)}
            />
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-2 md:flex">
          {session.isPending ? (
            <div className="size-9 animate-pulse rounded-full bg-gray-200" />
          ) : (
            authDesktop
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-md text-gray-700 transition-colors hover:bg-gray-100 md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <nav
            className="flex flex-col gap-1 px-4 py-3"
            aria-label="Mobile navigation"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                active={isActive(link.href)}
                className="px-3 py-2"
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </nav>

          <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3">
            {session.isPending ? (
              <div className="h-10 animate-pulse rounded-md bg-gray-100" />
            ) : isLoggedIn && user ? (
              <>
                {/* Mobile User Information */}
                <div className="flex items-center gap-3">
                  <UserAvatar user={user} />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {user.name}
                    </p>

                    <p className="truncate text-xs text-gray-500">
                      {user.email}
                    </p>
                  </div>
                </div>

                <Link
                  href={
                    DASHBOARD_ROUTES[
                      user.role === "technician" || user.role === "admin"
                        ? user.role
                        : "customer"
                    ]
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  <Button variant="outline" className="w-full gap-2">
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </Button>
                </Link>

                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                >
                  <Button variant="outline" className="w-full gap-2">
                    <UserRound className="size-4" />
                    Update Profile
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  className="w-full gap-2 text-red-600 hover:text-red-700"
                  onClick={async () => {
                    try {
                      const { error } = await authClient.signOut();

                      if (error) {
                        console.error("Sign out error:", error);
                        return;
                      }

                      setMobileOpen(false);
                      router.push("/sign-in");
                      router.refresh();
                    } catch (error) {
                      console.error("Sign out error:", error);
                    }
                  }}
                >
                  <LogOut className="size-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                >
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>

                <Link
                  href="/sign-up"
                  onClick={() => setMobileOpen(false)}
                >
                  <Button className="w-full bg-orange-600 text-white hover:bg-orange-700">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
