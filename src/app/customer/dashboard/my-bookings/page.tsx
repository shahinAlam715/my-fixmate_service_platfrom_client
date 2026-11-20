import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getMyBookings, type IBooking } from "@/all-api/bookingapi";
import MyBookings from "@/components/MyBookings";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { auth } from "@/lib/auth";

// ===============================
// Helpers
// ===============================

/** Backend responds with a plain array (or sometimes a `{ data: [...] }` envelope). */
const normalizeBookings = (payload: unknown): IBooking[] => {
  if (Array.isArray(payload)) return payload as IBooking[];

  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data: unknown }).data;
    if (Array.isArray(data)) return data as IBooking[];
  }

  return [];
};

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

// ===============================
// Page (server) — session + bookings
// ===============================

export default async function MyBookingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  const customerEmail = user?.email ?? "";
  const userName = user?.name?.trim() || "Guest User";

  let bookings: IBooking[] = [];
  let loadError: string | null = null;

  if (!customerEmail) {
    loadError = "You are not signed in. Please sign in to view your bookings.";
  } else {
    try {
      bookings = normalizeBookings(await getMyBookings(customerEmail));
    } catch (error) {
      console.error("Failed to fetch my bookings:", error);
      loadError =
        error instanceof Error ? error.message : "Failed to load your bookings.";
    }
  }

  return (
    <div className="space-y-5">
      {/* Top bar: back link + signed-in user (no sign out here) */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>

        <div className="flex min-w-0 items-center gap-2.5">
          <div className="min-w-0 text-right">
            <p className="max-w-[45vw] truncate text-sm leading-tight font-semibold sm:max-w-[200px]">
              {userName}
            </p>
            <p className="text-xs text-muted-foreground">Customer</p>
          </div>

          <Avatar size="lg" className="shrink-0 ring-1 ring-border">
            {user?.image ? (
              <AvatarImage
                src={user.image}
                alt={userName}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="bg-orange-600 text-xs font-semibold text-white">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          My Bookings
        </h1>
      </div>

      <MyBookings
        bookings={bookings}
        customerEmail={customerEmail}
        error={loadError}
      />
    </div>
  );
}
