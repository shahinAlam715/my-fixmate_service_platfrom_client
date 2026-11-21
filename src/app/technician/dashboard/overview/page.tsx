"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { getTechnicianBookings, type IBooking } from "@/all-api/bookingapi";
import { getTechnicianEarnings, type IPayment } from "@/all-api/paymentapi";

// ================================
// HELPERS
// ================================

/** $420 — no decimals for whole amounts, up to 2 otherwise. */
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

/** RH — first letter of up to two name parts. */
const getInitials = (name?: string) => {
  const parts = name?.trim().split(/\s+/) ?? [];

  if (parts.length === 0) return "TE";

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

/** Backend responds a plain array (or sometimes a `{ data: [...] }` envelope). */
const normalizeBookings = (payload: unknown): IBooking[] => {
  if (Array.isArray(payload)) return payload as IBooking[];

  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data: unknown }).data;
    if (Array.isArray(data)) return data as IBooking[];
  }

  return [];
};

/** Backend responds `{ success, totalPayments, totalEarnings, payments }`. */
const normalizePayments = (payload: unknown): IPayment[] => {
  if (Array.isArray(payload)) return payload as IPayment[];

  if (payload && typeof payload === "object") {
    const payments = (payload as { payments?: unknown }).payments;
    if (Array.isArray(payments)) return payments as IPayment[];
  }

  return [];
};

const getStatusLabel = (status: IBooking["status"]) => {
  switch (status) {
    case "requested":
      return "Requested";
    case "accepted":
      return "Accepted";
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
};

const getStatusStyle = (status: IBooking["status"]) => {
  switch (status) {
    case "requested":
      return "bg-blue-100 text-blue-800";
    case "accepted":
      return "bg-sky-100 text-sky-800";
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
};

// ================================
// TECHNICIAN OVERVIEW PAGE
// ================================

export default function OverviewPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const technicianEmail = session?.user?.email;

  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ================================
  // LOAD MY BOOKINGS + EARNINGS
  // ================================
  useEffect(() => {
    if (sessionLoading || !technicianEmail) return;

    let cancelled = false;

    Promise.all([getTechnicianBookings(technicianEmail), getTechnicianEarnings(technicianEmail)])
      .then(([bookingsPayload, earningsPayload]: [unknown, unknown]) => {
        if (cancelled) return;

        setBookings(normalizeBookings(bookingsPayload));
        setPayments(normalizePayments(earningsPayload));
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        console.error("Technician overview error:", err);

        setBookings([]);
        setPayments([]);
        setError(
          err instanceof Error ? err.message : "Failed to load your overview."
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [technicianEmail, sessionLoading]);

  // ================================
  // STATS
  // ================================
  const totalServices = bookings.length;

  /** Approved = the technician is actually working on it. */
  const approvedServices = bookings.filter((booking) =>
    ["accepted", "in-progress", "completed"].includes(booking.status)
  ).length;

  const pendingRequests = bookings.filter(
    (booking) => booking.status === "requested"
  ).length;

  // ================================
  // JOBS COMPLETED PER MONTH (last 6 months)
  // ================================
  const monthlyCompleted = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; label: string; count: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

      buckets.push({
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString("en-US", { month: "short" }),
        count: 0,
      });
    }

    const index = new Map(buckets.map((bucket, i) => [bucket.key, i]));

    bookings.forEach((booking) => {
      if (booking.status !== "completed") return;

      const date = new Date(booking.updatedAt ?? booking.createdAt);
      if (Number.isNaN(date.getTime())) return;

      const bucketIndex = index.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (bucketIndex !== undefined) buckets[bucketIndex].count += 1;
    });

    return buckets;
  }, [bookings]);

  const maxCompleted = Math.max(1, ...monthlyCompleted.map((b) => b.count));

  // ================================
  // EARNINGS THIS MONTH
  // ================================
  const earningsThisMonth = useMemo(() => {
    const now = new Date();

    const paidThisMonth = payments.filter((payment) => {
      const date = new Date(payment.paidAt);
      if (Number.isNaN(date.getTime())) return false;

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });

    const total = paidThisMonth.reduce(
      (sum, payment) => sum + (Number(payment.amount) || 0),
      0
    );

    return { total, count: paidThisMonth.length };
  }, [payments]);

  // ================================
  // SORTED FOR TABLE
  // ================================
  const sortedBookings = useMemo(
    () =>
      [...bookings].sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime() || 0;
        const bTime = new Date(b.createdAt).getTime() || 0;
        return bTime - aTime;
      }),
    [bookings]
  );

  // ================================
  // RENDER
  // ================================

  // Signed out — the proxy normally handles this, but never render a blank page.
  if (!sessionLoading && !technicianEmail) {
    return (
      <div className="min-h-screen bg-[#f3f6fa] text-[#0b1f44]">
        <header className="flex h-12 items-center justify-between border-b border-gray-100 bg-white px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-1 text-xs text-slate-500 transition hover:text-orange-600"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Home
          </Link>
        </header>

        <main className="px-4 py-5 sm:px-5 sm:py-6">
          <h1 className="mb-4 text-2xl font-bold tracking-tight text-[#0b1f44] sm:text-3xl">
            Overview
          </h1>

          <div className="rounded-xl border border-[#e3eaf2] bg-white px-5 py-8 text-center text-sm text-gray-500">
            Please sign in to view your overview.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f6fa] text-[#0b1f44]">
      {/* ================================
          HEADER
      ================================ */}
      <header className="flex h-12 items-center justify-between border-b border-gray-100 bg-white px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1 text-xs text-slate-500 transition hover:text-orange-600"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Home
        </Link>

        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-200 text-[11px] font-semibold text-orange-800">
            {getInitials(session?.user?.name)}
          </div>

          <div className="min-w-0 leading-tight">
            <p className="truncate text-[11px] font-semibold text-[#0b1f44]">
              {session?.user?.name || "Technician"}
            </p>

            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">
              Technician
            </span>
          </div>
        </div>
      </header>

      {/* ================================
          MAIN CONTENT
      ================================ */}
      <main className="px-4 py-5 sm:px-5 sm:py-6">
        {/* TITLE */}
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-[#0b1f44] sm:text-3xl">
          Overview
        </h1>

        {/* ================================
            LOAD ERROR
        ================================ */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading overview...
          </div>
        ) : (
          <>
            {/* ================================
                STAT CARDS
            ================================ */}
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#e3eaf2] bg-white px-4 py-4 sm:px-5 sm:py-5">
                <p className="text-3xl font-bold tracking-tight text-[#0b1f44]">
                  {totalServices}
                </p>
                <p className="mt-1 text-xs text-slate-500">Total Services</p>
              </div>

              <div className="rounded-xl border border-[#e3eaf2] bg-white px-4 py-4 sm:px-5 sm:py-5">
                <p className="text-3xl font-bold tracking-tight text-[#0b1f44]">
                  {approvedServices}
                </p>
                <p className="mt-1 text-xs text-slate-500">Approved Services</p>
              </div>

              <div className="rounded-xl border border-[#e3eaf2] bg-white px-4 py-4 sm:px-5 sm:py-5">
                <p className="text-3xl font-bold tracking-tight text-[#0b1f44]">
                  {pendingRequests}
                </p>
                <p className="mt-1 text-xs text-slate-500">Pending Requests</p>
              </div>
            </div>

            {/* ================================
                CHART + EARNINGS THIS MONTH
            ================================ */}
            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* JOBS COMPLETED */}
              <div className="rounded-xl border border-[#e3eaf2] bg-white px-4 py-4 sm:px-5 sm:py-5">
                <h2 className="mb-4 text-sm font-semibold text-[#0b1f44]">
                  Jobs completed
                </h2>

                <div
                  className="flex h-36 items-end gap-2 sm:gap-3"
                  role="img"
                  aria-label="Jobs completed over the last six months"
                >
                  {monthlyCompleted.map((bucket, i) => {
                    const height =
                      bucket.count > 0
                        ? Math.max((bucket.count / maxCompleted) * 100, 12)
                        : 5;

                    return (
                      <div
                        key={bucket.key}
                        title={`${bucket.label}: ${bucket.count} completed job${
                          bucket.count === 1 ? "" : "s"
                        }`}
                        className={`flex-1 rounded-t ${
                          i === monthlyCompleted.length - 1
                            ? "bg-orange-600"
                            : "bg-[#0b1f44]"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* EARNINGS THIS MONTH */}
              <div className="rounded-xl border border-[#e3eaf2] bg-white px-4 py-4 sm:px-5 sm:py-5">
                <h2 className="text-sm font-semibold text-[#0b1f44]">
                  Earnings this month
                </h2>

                <p className="mt-4 text-4xl font-bold tracking-tight text-[#0b1f44]">
                  {formatCurrency(earningsThisMonth.total)}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  From {earningsThisMonth.count} paid job
                  {earningsThisMonth.count === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {/* ================================
                BOOKINGS TABLE
            ================================ */}
            <div className="overflow-hidden rounded-xl border border-[#e3eaf2] bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left">
                  {/* TABLE HEADER */}
                  <thead>
                    <tr className="bg-[#f8fafc] text-[9px] font-medium uppercase tracking-wide text-[#0b1f44]">
                      <th className="px-3 py-3">Customer</th>
                      <th className="px-3 py-3">Service</th>
                      <th className="px-3 py-3">Status</th>
                    </tr>
                  </thead>

                  {/* TABLE BODY */}
                  <tbody>
                    {sortedBookings.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-12 text-center text-sm text-gray-500"
                        >
                          No bookings yet.
                        </td>
                      </tr>
                    ) : (
                      sortedBookings.map((booking) => (
                        <tr
                          key={booking._id}
                          className="border-t border-[#e8edf3] text-[10px] transition hover:bg-gray-50"
                        >
                          {/* CUSTOMER */}
                          <td className="px-3 py-3">
                            {booking.customerName || "N/A"}
                          </td>

                          {/* SERVICE */}
                          <td className="px-3 py-3">
                            {booking.serviceTitle || "N/A"}
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
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
