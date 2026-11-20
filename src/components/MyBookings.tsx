"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

import { cancelBooking, type IBooking } from "@/all-api/bookingapi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";

// ===============================
// Display meta
// ===============================

const STATUS_META: Record<
  IBooking["status"],
  { label: string; className: string }
> = {
  requested: { label: "Requested", className: "bg-blue-100 text-blue-700" },
  accepted: { label: "Accepted", className: "bg-indigo-100 text-indigo-700" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
  "in-progress": {
    label: "In Progress",
    className: "bg-amber-100 text-amber-700",
  },
  completed: { label: "Completed", className: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-600" },
};

const PAYMENT_META = {
  paid: { label: "Paid", className: "bg-green-100 text-green-700" },
  unpaid: { label: "Unpaid", className: "bg-gray-100 text-gray-600" },
} as const;

const ACTIVE_STATUSES: IBooking["status"][] = [
  "requested",
  "accepted",
  "in-progress",
];

const BADGE_CLASS =
  "inline-flex rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap";

// ===============================
// Formatting helpers
// ===============================

const formatDate = (value: string | Date) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

const formatAmount = (booking: IBooking) => {
  const amount = booking.finalAmount || booking.basePrice || 0;
  return `$${amount}`;
};

const getStatusMeta = (status: IBooking["status"]) =>
  STATUS_META[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-600",
  };

const getPaymentMeta = (status: IBooking["paymentStatus"]) =>
  PAYMENT_META[status] ?? PAYMENT_META.unpaid;

// ===============================
// Component
// ===============================

export default function MyBookings({
  bookings,
  customerEmail,
  error,
}: {
  bookings: IBooking[];
  customerEmail: string;
  error: string | null;
}) {
  const router = useRouter();

  const [rows, setRows] = useState<IBooking[]>(bookings);
  const [cancelTarget, setCancelTarget] = useState<IBooking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const total = rows.length;
  const active = rows.filter((booking) =>
    ACTIVE_STATUSES.includes(booking.status)
  ).length;
  const completed = rows.filter(
    (booking) => booking.status === "completed"
  ).length;

  const stats = [
    { label: "Total Requests", value: total },
    { label: "Active Jobs", value: active },
    { label: "Completed Jobs", value: completed },
  ];

  // ===============================
  // Cancel booking (bookingapi.ts)
  // ===============================

  const handleCancel = async () => {
    if (!cancelTarget) return;

    setIsCancelling(true);

    try {
      await cancelBooking(cancelTarget._id, customerEmail);

      setRows((prev) =>
        prev.map((booking) =>
          booking._id === cancelTarget._id
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );

      toast.success("Booking cancelled.");
      setCancelTarget(null);
    } catch (error) {
      console.error("Cancel booking error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel booking."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const renderAction = (booking: IBooking) =>
    booking.status === "requested" ? (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setCancelTarget(booking)}
        disabled={isCancelling}
      >
        Cancel
      </Button>
    ) : (
      <span className="text-muted-foreground">—</span>
    );

  // ===============================
  // Load failed
  // ===============================

  if (error) {
    return (
      <div className="rounded-xl border bg-background p-8 text-center shadow-xs sm:p-10">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => router.refresh()}
        >
          <RefreshCw />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border bg-background p-4 shadow-xs sm:p-5"
          >
            <p className="text-2xl font-bold tracking-tight sm:text-3xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border bg-background p-10 text-center shadow-xs">
          <p className="font-medium">No bookings yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Book a service and it will show up here.
          </p>
          <Link
            href="/services"
            className={`${buttonVariants({ variant: "outline", size: "sm" })} mt-4`}
          >
            Browse Services
          </Link>
        </div>
      ) : (
        <>
          {/* Table — large screens */}
          <div className="hidden overflow-x-auto rounded-xl border bg-background shadow-xs lg:block">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Technician</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((booking) => {
                  const status = getStatusMeta(booking.status);
                  const payment = getPaymentMeta(booking.paymentStatus);

                  return (
                    <tr
                      key={booking._id}
                      className="border-b transition-colors last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-medium">
                        {booking.serviceTitle}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {booking.technicianName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {formatDate(booking.preferredDate)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatAmount(booking)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`${BADGE_CLASS} ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`${BADGE_CLASS} ${payment.className}`}
                        >
                          {payment.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">{renderAction(booking)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards — small screens */}
          <div className="space-y-3 lg:hidden">
            {rows.map((booking) => {
              const status = getStatusMeta(booking.status);
              const payment = getPaymentMeta(booking.paymentStatus);

              return (
                <div
                  key={booking._id}
                  className="rounded-xl border bg-background p-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {booking.serviceTitle}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {booking.technicianName}
                      </p>
                    </div>

                    <span className={`${BADGE_CLASS} ${status.className}`}>
                      {status.label}
                    </span>
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <dt className="text-xs uppercase text-muted-foreground">
                        Date
                      </dt>
                      <dd className="mt-0.5 whitespace-nowrap">
                        {formatDate(booking.preferredDate)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs uppercase text-muted-foreground">
                        Amount
                      </dt>
                      <dd className="mt-0.5">{formatAmount(booking)}</dd>
                    </div>

                    <div>
                      <dt className="text-xs uppercase text-muted-foreground">
                        Payment
                      </dt>
                      <dd className="mt-0.5">
                        <span
                          className={`${BADGE_CLASS} ${payment.className}`}
                        >
                          {payment.label}
                        </span>
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs uppercase text-muted-foreground">
                        Action
                      </dt>
                      <dd className="mt-0.5">{renderAction(booking)}</dd>
                    </div>
                  </dl>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Cancel confirmation */}
      <AlertDialog
        open={!!cancelTarget}
        onOpenChange={(open) => {
          if (!open && !isCancelling) setCancelTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>

            <AlertDialogDescription>
              <span className="font-semibold text-foreground">
                {cancelTarget?.serviceTitle}
              </span>{" "}
              will be cancelled. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              Keep Booking
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleCancel();
              }}
              disabled={isCancelling}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Booking"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
