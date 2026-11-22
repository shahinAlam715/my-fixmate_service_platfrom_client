
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Check } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { adminAcceptRejectedBooking, getAllBookings, IBooking } from "@/all-api/bookingapi";

type FilterStatus = "all" | "requested" | "in-progress" | "completed";

const filters: { label: string; value: FilterStatus }[] = [
  { label: "All", value: "all" },
  { label: "Requested", value: "requested" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
];

// ================================
// STATUS LABEL
// ================================
function getStatusLabel(status: IBooking["status"]) {
  switch (status) {
    case "requested":
      return "Requested";
    case "accepted":
    case "in-progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "rejected":
      return "Rejected";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

// ================================
// STATUS STYLE
// ================================
function getStatusStyle(status: IBooking["status"]) {
  switch (status) {
    case "requested":
      return "bg-blue-100 text-blue-800";
    case "accepted":
    case "in-progress":
      return "bg-amber-100 text-amber-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "cancelled":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// ================================
// PAYMENT STYLE
// ================================
function getPaymentStyle(paymentStatus: IBooking["paymentStatus"]) {
  return paymentStatus === "paid"
    ? "bg-green-100 text-green-800"
    : "bg-gray-100 text-gray-800";
}

// ================================
// FORMAT DATE
// ================================
function formatDate(date: string | Date) {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "N/A";

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

// ================================
// BOOKING AMOUNT
// ================================
function getBookingAmount(booking: IBooking) {
  return booking.finalAmount > 0
    ? booking.finalAmount
    : booking.basePrice;
}

export default function AdminBookingsPage() {
  const { data: session, isPending: sessionLoading } =
    authClient.useSession();

  const adminEmail = session?.user?.email;

  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [activeFilter, setActiveFilter] =
    useState<FilterStatus>("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  // Track currently accepting booking
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // ================================
  // LOAD BOOKINGS
  // ================================
  useEffect(() => {
    if (sessionLoading || !adminEmail) return;

    let cancelled = false;

    getAllBookings()
      .then((data) => {
        if (cancelled) return;

        setBookings(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        console.error("Admin bookings error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load bookings"
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
  }, [sessionLoading, adminEmail]);

  // ================================
  // FILTER BOOKINGS
  // ================================
  const filteredBookings = useMemo(() => {
    if (activeFilter === "all") {
      return bookings;
    }

    if (activeFilter === "in-progress") {
      return bookings.filter(
        (booking) =>
          booking.status === "accepted" ||
          booking.status === "in-progress"
      );
    }

    return bookings.filter(
      (booking) => booking.status === activeFilter
    );
  }, [bookings, activeFilter]);

  // ================================
  // ADMIN ACCEPT REJECTED BOOKING
  // ================================
  const handleAdminAccept = async (bookingId: string) => {
    if (!adminEmail || acceptingId) return;

    const confirmed = window.confirm(
      "Are you sure you want to accept this rejected booking?"
    );

    if (!confirmed) return;

    try {
      setAcceptingId(bookingId);
      setActionError("");

      await adminAcceptRejectedBooking(bookingId);

      // Update UI without reloading
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                status: "accepted",
                updatedAt: new Date(),
              }
            : booking
        )
      );
    } catch (err: unknown) {
      console.error("Admin accept error:", err);

      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to accept booking"
      );
    } finally {
      setAcceptingId(null);
    }
  };

  // ================================
  // SESSION LOADING
  // ================================
  if (sessionLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
      </div>
    );
  }

  // ================================
  // ADMIN CHECK
  // ================================
  if (!adminEmail) {
    return (
      <div className="flex min-h-[300px] items-center justify-center px-4">
        <p className="text-sm text-red-500">
          Please login as admin to view bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f6fa] text-[#0b1f44]">
      {/* ================================
          HEADER
      ================================ */}
      <header className="flex h-12 items-center justify-between border-b border-gray-100 bg-white px-5 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-1 text-xs text-slate-500 transition hover:text-orange-600"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Home
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-200 text-xs font-semibold text-orange-800">
            {session?.user?.name?.charAt(0)?.toUpperCase() || "AD"}
          </div>

          <div className="leading-tight">
            <p className="text-[11px] font-semibold text-[#0b1f44]">
              FixMate Admin
            </p>

            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">
              Admin
            </span>
          </div>
        </div>
      </header>

      {/* ================================
          MAIN CONTENT
      ================================ */}
      <main className="px-4 py-5 sm:px-5">
        {/* TITLE */}
        <h1 className="mb-3 text-2xl font-bold tracking-tight text-[#0b1f44]">
          Bookings
        </h1>

        {/* ================================
            FILTER TABS
        ================================ */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-lg border px-3 py-2 text-[10px] font-medium transition ${
                activeFilter === filter.value
                  ? "border-orange-700 bg-orange-700 text-white"
                  : "border-gray-200 bg-white text-[#0b1f44] hover:bg-gray-100"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* ================================
            LOAD ERROR
        ================================ */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ================================
            ACTION ERROR
        ================================ */}
        {actionError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {actionError}
          </div>
        )}

        {/* ================================
            BOOKINGS TABLE
        ================================ */}
        <div className="overflow-hidden rounded-xl border border-[#e3eaf2] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              {/* TABLE HEADER */}
              <thead>
                <tr className="bg-[#f8fafc] text-[9px] font-medium uppercase tracking-wide text-[#0b1f44]">
                  <th className="px-3 py-3">Service</th>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Technician</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Amount</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Payment</th>
                  <th className="px-3 py-3">Action</th>
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading bookings...
                      </div>
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 text-center text-sm text-gray-500"
                    >
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="border-t border-[#e8edf3] text-[10px] transition hover:bg-gray-50"
                    >
                      {/* SERVICE */}
                      <td className="px-3 py-3">
                        {booking.serviceTitle || "N/A"}
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-3 py-3">
                        {booking.customerName || "N/A"}
                      </td>

                      {/* TECHNICIAN */}
                      <td className="px-3 py-3">
                        {booking.technicianName || "N/A"}
                      </td>

                      {/* DATE */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        {formatDate(booking.preferredDate)}
                      </td>

                      {/* AMOUNT */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        ${getBookingAmount(booking)}
                      </td>

                      {/* STATUS */}
                      <td className="px-3 py-3">
                        <span
                          className={`inline-block whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-medium ${getStatusStyle(
                            booking.status
                          )}`}
                        >
                          {getStatusLabel(booking.status)}
                        </span>
                      </td>

                      {/* PAYMENT */}
                      <td className="px-3 py-3">
                        <span
                          className={`inline-block whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-medium capitalize ${getPaymentStyle(
                            booking.paymentStatus
                          )}`}
                        >
                          {booking.paymentStatus || "unpaid"}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="px-3 py-3">
                        {booking.status === "rejected" ? (
                          <button
                            onClick={() =>
                              handleAdminAccept(booking._id)
                            }
                            disabled={acceptingId !== null}
                            className="inline-flex items-center gap-1 rounded-md bg-green-600 px-2 py-1.5 text-[9px] font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {acceptingId === booking._id ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Accepting
                              </>
                            ) : (
                              <>
                                <Check className="h-3 w-3" />
                                Accept
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
