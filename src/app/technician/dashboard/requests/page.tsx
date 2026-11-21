
"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { useSession } from "@/lib/auth-client";
import {
  getTechnicianBookings,
  updateBookingStatus,
} from "@/all-api/bookingapi";

import type { IBooking } from "@/all-api/bookingapi";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ========================================
// TYPES
// ========================================

type BookingStatus = IBooking["status"];

type FilterStatus =
  | "all"
  | "requested"
  | "accepted"
  | "in-progress"
  | "completed";

// ========================================
// STATUS CONFIG
// ========================================

const statusStyles: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  requested: {
    label: "Requested",
    className: "bg-blue-100 text-blue-700",
  },
  accepted: {
    label: "Accepted",
    className: "bg-indigo-100 text-indigo-700",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-amber-100 text-amber-700",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-700",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-600",
  },
};

const filters: { label: string; value: FilterStatus }[] = [
  { label: "All", value: "all" },
  { label: "Requested", value: "requested" },
  { label: "Accepted", value: "accepted" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
];

// ========================================
// MAIN COMPONENT
// ========================================

export default function ManageRequestsPage() {
  const { data: session, isPending: sessionLoading } = useSession();

  const technicianEmail = session?.user?.email;

  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<FilterStatus>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // "Mark as complete" dialog state
  const [completeTarget, setCompleteTarget] =
    useState<IBooking | null>(null);
  const [finalAmount, setFinalAmount] = useState("");
  const [amountError, setAmountError] = useState("");

  // ========================================
  // INITIAL FETCH
  // ========================================

  useEffect(() => {
    if (sessionLoading || !technicianEmail) return;

    let cancelled = false;

    getTechnicianBookings(technicianEmail)
      .then((data) => {
        if (cancelled) return;

        setBookings(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        console.error("Failed to load bookings:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load repair requests"
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sessionLoading, technicianEmail]);

  // ========================================
  // REFRESH BOOKINGS
  // ========================================

  const fetchBookings = async () => {
    if (!technicianEmail) return;

    try {
      setLoading(true);
      setError("");

      const data = await getTechnicianBookings(technicianEmail);

      setBookings(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error("Refresh bookings error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to refresh bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // STATS
  // ========================================

  const stats = useMemo(() => {
    const approved = bookings.filter((booking) =>
      ["accepted", "in-progress", "completed"].includes(
        booking.status
      )
    ).length;

    const pending = bookings.filter(
      (booking) => booking.status === "requested"
    ).length;

    const completed = bookings.filter(
      (booking) => booking.status === "completed"
    ).length;

    return {
      total: bookings.length,
      approved,
      pending,
      completed,
    };
  }, [bookings]);

  // ========================================
  // FILTER BOOKINGS
  // ========================================

  const filteredBookings = useMemo(() => {
    if (activeFilter === "all") return bookings;

    return bookings.filter(
      (booking) => booking.status === activeFilter
    );
  }, [bookings, activeFilter]);

  // ========================================
  // UPDATE BOOKING STATUS
  // ========================================

  const handleStatusUpdate = async (
    booking: IBooking,
    newStatus: BookingStatus
  ) => {
    if (updatingId) return;

    if (newStatus === "rejected") {
      const confirmed = window.confirm(
        "Are you sure you want to reject this repair request?"
      );

      if (!confirmed) return;
    }

    try {
      setUpdatingId(booking._id);
      setError("");

      await updateBookingStatus(booking._id, {
        status: newStatus,
      });

      setBookings((prev) =>
        prev.map((item) =>
          item._id === booking._id
            ? { ...item, status: newStatus }
            : item
        )
      );
    } catch (err: unknown) {
      console.error("Status update error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update booking status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ========================================
  // OPEN "MARK AS COMPLETE" DIALOG
  // Default amount comes from the API (basePrice)
  // ========================================

  const openCompleteDialog = (booking: IBooking) => {
    if (updatingId) return;

    setAmountError("");
    setFinalAmount(
      booking.finalAmount > 0
        ? String(booking.finalAmount)
        : String(booking.basePrice ?? "")
    );
    setCompleteTarget(booking);
  };

  // ========================================
  // SUBMIT COMPLETION + FINAL AMOUNT
  // PATCH /bookings/:id/status
  // ========================================

  const handleCompleteSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!completeTarget || updatingId) return;

    const amount = Number(finalAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setAmountError("Please enter a valid amount greater than 0.");
      return;
    }

    try {
      setUpdatingId(completeTarget._id);
      setAmountError("");
      setError("");

      await updateBookingStatus(completeTarget._id, {
        status: "completed",
        finalAmount: amount,
      });

      setBookings((prev) =>
        prev.map((item) =>
          item._id === completeTarget._id
            ? { ...item, status: "completed", finalAmount: amount }
            : item
        )
      );

      setCompleteTarget(null);
    } catch (err: unknown) {
      console.error("Complete booking error:", err);

      setAmountError(
        err instanceof Error
          ? err.message
          : "Failed to mark booking as completed"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ========================================
  // SESSION LOADING
  // ========================================

  if (sessionLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  // ========================================
  // LOGIN CHECK
  // ========================================

  if (!technicianEmail) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <XCircle className="mx-auto h-10 w-10 text-red-500" />

          <h2 className="mt-3 font-semibold text-slate-900">
            Technician Login Required
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Please login to view your repair requests.
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // PAGE LOADING
  // ========================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-orange-600" />

          <p className="mt-3 text-sm text-slate-500">
            Loading requests...
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <div className="min-h-screen bg-[#f4f6f9] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-5">

        {/* HEADER */}

        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Manage Requests
          </h1>

          <button
            onClick={fetchBookings}
            disabled={loading}
            title="Refresh"
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* STATS */}

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">

          {/* TOTAL SERVICES */}

          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
            <h2 className="text-2xl font-bold text-slate-900">
              {stats.total}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Total Services
            </p>
          </div>

          {/* APPROVED */}

          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
            <h2 className="text-2xl font-bold text-slate-900">
              {stats.approved}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Approved
            </p>
          </div>

          {/* PENDING */}

          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
            <h2 className="text-2xl font-bold text-slate-900">
              {stats.pending}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Pending Requests
            </p>
          </div>

          {/* CHART */}

          <div className="flex items-end justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-4">
            <div
              className="w-10 bg-blue-100"
              style={{
                height: `${Math.max(
                  20,
                  (stats.pending / Math.max(stats.total, 1)) * 60
                )}px`,
              }}
            />

            <div
              className="w-10 bg-amber-100"
              style={{
                height: `${Math.max(
                  20,
                  (stats.approved / Math.max(stats.total, 1)) * 80
                )}px`,
              }}
            />

            <div
              className="w-10 bg-emerald-100"
              style={{
                height: `${Math.max(
                  20,
                  (stats.completed / Math.max(stats.total, 1)) * 100
                )}px`,
              }}
            />
          </div>
        </div>

        {/* FILTERS */}

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                activeFilter === filter.value
                  ? "border-orange-700 bg-orange-700 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px]">

              {/* HEADER */}

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-slate-600">
                    Customer
                  </th>

                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-slate-600">
                    Service
                  </th>

                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-slate-600">
                    Problem
                  </th>

                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-slate-600">
                    Status
                  </th>

                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-slate-600">
                    Amount
                  </th>

                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-slate-600">
                    Payment
                  </th>

                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* BODY */}

              <tbody>
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className="border-b border-slate-100 transition hover:bg-slate-50 last:border-0"
                  >
                    {/* CUSTOMER */}

                    <td className="px-3 py-3">
                      <div className="text-sm font-medium text-slate-800">
                        {booking.customerName || "Customer"}
                      </div>

                      <div className="text-xs text-slate-500">
                        {booking.customerPhone || ""}
                      </div>
                    </td>

                    {/* SERVICE */}

                    <td className="px-3 py-3 text-sm text-slate-700">
                      {booking.serviceTitle || "Repair Service"}
                    </td>

                    {/* PROBLEM */}

                    <td className="px-3 py-3">
                      <p className="max-w-[250px] truncate text-sm text-slate-700">
                        {booking.problemDescription || "N/A"}
                      </p>
                    </td>

                    {/* STATUS */}

                    <td className="px-3 py-3">
                      <StatusBadge status={booking.status} />
                    </td>

                    {/* AMOUNT */}

                    <td className="px-3 py-3 text-sm font-medium text-slate-800">
                      {booking.finalAmount > 0
                        ? `$${booking.finalAmount}`
                        : booking.basePrice > 0
                          ? `$${booking.basePrice}`
                          : "—"}
                    </td>

                    {/* PAYMENT STATUS */}

                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          booking.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {booking.paymentStatus === "paid"
                          ? "Paid"
                          : "Unpaid"}
                      </span>
                    </td>

                    {/* ACTIONS */}

                    <td className="px-3 py-3">
                      <ActionButtons
                        booking={booking}
                        updatingId={updatingId}
                        onUpdate={handleStatusUpdate}
                        onCompleteClick={openCompleteDialog}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* EMPTY STATE */}

          {filteredBookings.length === 0 && (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-medium text-slate-700">
                No requests found
              </p>

              <p className="mt-1 text-xs text-slate-500">
                No repair requests available for this filter.
              </p>
            </div>
          )}
        </div>

        {/* ========================================
            MARK AS COMPLETE DIALOG
            ======================================== */}

        <Dialog
          open={!!completeTarget}
          onOpenChange={(open) => {
            if (!open && !updatingId) {
              setCompleteTarget(null);
              setAmountError("");
            }
          }}
        >
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Mark as Complete</DialogTitle>

                <DialogDescription>
                  Set the final amount for this service, then confirm
                  completion. The customer will see this amount.
                </DialogDescription>
              </DialogHeader>

              {/* SERVICE SUMMARY */}

              {completeTarget && (
                <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                  <p className="font-medium text-slate-800">
                    {completeTarget.serviceTitle || "Repair Service"}
                  </p>

                  <p className="text-xs text-slate-500">
                    {completeTarget.customerName || "Customer"} · Default
                    amount: ${completeTarget.basePrice ?? 0}
                  </p>
                </div>
              )}

              {/* FINAL AMOUNT */}

              <div className="space-y-2">
                <label
                  htmlFor="final-amount"
                  className="text-sm font-medium text-slate-800"
                >
                  Final Amount (USD)
                </label>

                <input
                  id="final-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={finalAmount}
                  onChange={(e) => {
                    setFinalAmount(e.target.value);
                    setAmountError("");
                  }}
                  placeholder="e.g. 45"
                  required
                  autoFocus
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

                {amountError && (
                  <p className="text-xs font-medium text-red-600">
                    {amountError}
                  </p>
                )}
              </div>

              {/* ACTIONS */}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCompleteTarget(null)}
                  disabled={!!updatingId}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={!!updatingId}
                  className="bg-orange-600 text-white hover:bg-orange-700"
                >
                  {updatingId ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    "Confirm Complete"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// ========================================
// STATUS BADGE
// ========================================

function StatusBadge({ status }: { status: BookingStatus }) {
  const config = statusStyles[status] || statusStyles.requested;

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

// ========================================
// ACTION BUTTONS
// ========================================

function ActionButtons({
  booking,
  updatingId,
  onUpdate,
  onCompleteClick,
}: {
  booking: IBooking;
  updatingId: string | null;
  onUpdate: (booking: IBooking, status: BookingStatus) => void;
  onCompleteClick: (booking: IBooking) => void;
}) {
  const isUpdating = updatingId === booking._id;

  const buttonClass =
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50";

  // REQUESTED

  if (booking.status === "requested") {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          disabled={isUpdating}
          onClick={() => onUpdate(booking, "accepted")}
          className={`${buttonClass} bg-orange-700 text-white hover:bg-orange-800`}
        >
          {isUpdating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "Accept"
          )}
        </button>

        <button
          disabled={isUpdating}
          onClick={() => onUpdate(booking, "rejected")}
          className={`${buttonClass} border border-slate-200 bg-white text-slate-700 hover:bg-slate-100`}
        >
          Reject
        </button>
      </div>
    );
  }

  // ACCEPTED

  if (booking.status === "accepted") {
    return (
      <button
        disabled={isUpdating}
        onClick={() => onUpdate(booking, "in-progress")}
        className={`${buttonClass} bg-orange-700 text-white hover:bg-orange-800`}
      >
        {isUpdating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          "Start Work"
        )}
      </button>
    );
  }

  // IN PROGRESS

  if (booking.status === "in-progress") {
    return (
      <button
        disabled={isUpdating}
        onClick={() => onCompleteClick(booking)}
        className={`${buttonClass} bg-orange-700 text-white hover:bg-orange-800`}
      >
        {isUpdating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          "Mark as Complete"
        )}
      </button>
    );
  }

  // COMPLETED

  if (booking.status === "completed") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
        Completed
      </span>
    );
  }

  // REJECTED

  if (booking.status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
        <XCircle className="h-3.5 w-3.5" />
        Rejected
      </span>
    );
  }

  // CANCELLED

  if (booking.status === "cancelled") {
    return (
      <span className="text-xs font-semibold text-slate-500">
        Cancelled
      </span>
    );
  }

  return null;
}
