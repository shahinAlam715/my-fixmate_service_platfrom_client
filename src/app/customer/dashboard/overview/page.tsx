"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CircleCheck } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { getMyBookings, type IBooking } from "@/all-api/bookingapi";

// ================================
// HELPERS
// ================================

/** $35 — no decimals for whole amounts, up to 2 otherwise. */
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

/** SK — first letter of up to two name parts. */
const getInitials = (name?: string) => {
  const parts = name?.trim().split(/\s+/) ?? [];

  if (parts.length === 0) return "CU";

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

const getStatusLabel = (status: IBooking["status"]) => {
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
};

const getStatusStyle = (status: IBooking["status"]) => {
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
};

const getPaymentStyle = (paymentStatus: IBooking["paymentStatus"]) =>
  paymentStatus === "paid"
    ? "bg-green-100 text-green-800"
    : "bg-gray-100 text-gray-700";

/** Bookings that still need the customer to pay. */
const NEEDS_PAYMENT_STATUSES: IBooking["status"][] = ["completed"];

// ================================
// CUSTOMER OVERVIEW PAGE
// ================================

export default function OverviewPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const customerEmail = session?.user?.email;

  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ================================
  // LOAD MY BOOKINGS
  // ================================
  useEffect(() => {
    if (sessionLoading || !customerEmail) return;

    let cancelled = false;

    getMyBookings(customerEmail)
      .then((payload: unknown) => {
        if (cancelled) return;

        setBookings(normalizeBookings(payload));
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        console.error("Overview bookings error:", err);

        setBookings([]);
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
  }, [customerEmail, sessionLoading]);

  // ================================
  // STATS
  // ================================
  const totalRequests = bookings.length;

  const activeJobs = bookings.filter((booking) =>
    ["accepted", "in-progress"].includes(booking.status)
  ).length;

  const completedJobs = bookings.filter(
    (booking) => booking.status === "completed"
  ).length;

  // ================================
  // REQUESTS PER MONTH (last 6 months)
  // ================================
  const monthlyRequests = useMemo(() => {
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
      const date = new Date(booking.createdAt);
      if (Number.isNaN(date.getTime())) return;

      const bucketIndex = index.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (bucketIndex !== undefined) buckets[bucketIndex].count += 1;
    });

    return buckets;
  }, [bookings]);

  const maxMonthly = Math.max(1, ...monthlyRequests.map((b) => b.count));

  // ================================
  // ACTION NEEDED
  // ================================
  const actionBooking =
    bookings.find(
      (booking) =>
        NEEDS_PAYMENT_STATUSES.includes(booking.status) &&
        booking.paymentStatus === "unpaid"
    ) ?? null;

  const actionAmount =
    Number(actionBooking?.finalAmount) || Number(actionBooking?.basePrice) || 0;

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
              {session?.user?.name || "Customer"}
            </p>

            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">
              Customer
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
                  {totalRequests}
                </p>
                <p className="mt-1 text-xs text-slate-500">Total Requests</p>
              </div>

              <div className="rounded-xl border border-[#e3eaf2] bg-white px-4 py-4 sm:px-5 sm:py-5">
                <p className="text-3xl font-bold tracking-tight text-[#0b1f44]">
                  {activeJobs}
                </p>
                <p className="mt-1 text-xs text-slate-500">Active Jobs</p>
              </div>

              <div className="rounded-xl border border-[#e3eaf2] bg-white px-4 py-4 sm:px-5 sm:py-5">
                <p className="text-3xl font-bold tracking-tight text-[#0b1f44]">
                  {completedJobs}
                </p>
                <p className="mt-1 text-xs text-slate-500">Completed Jobs</p>
              </div>
            </div>

            {/* ================================
                CHART + ACTION NEEDED
            ================================ */}
            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* REQUESTS PER MONTH */}
              <div className="rounded-xl border border-[#e3eaf2] bg-white px-4 py-4 sm:px-5 sm:py-5">
                <h2 className="mb-4 text-sm font-semibold text-[#0b1f44]">
                  Requests per month
                </h2>

                <div
                  className="flex h-36 items-end gap-2 sm:gap-3"
                  role="img"
                  aria-label="Requests per month for the last six months"
                >
                  {monthlyRequests.map((bucket, i) => {
                    const height =
                      bucket.count > 0
                        ? Math.max((bucket.count / maxMonthly) * 100, 12)
                        : 5;

                    return (
                      <div
                        key={bucket.key}
                        title={`${bucket.label}: ${bucket.count} request${
                          bucket.count === 1 ? "" : "s"
                        }`}
                        className={`flex-1 rounded-t ${
                          i === monthlyRequests.length - 1
                            ? "bg-orange-600"
                            : "bg-[#0b1f44]"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* ACTION NEEDED */}
              <div className="rounded-xl border border-[#e3eaf2] bg-white px-4 py-4 sm:px-5 sm:py-5">
                <h2 className="text-sm font-semibold text-[#0b1f44]">
                  Action needed
                </h2>

                {actionBooking ? (
                  <>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {actionBooking.serviceTitle || "Your service"} is
                      completed. Pay to close the job.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/stripepayment?id=${encodeURIComponent(
                            actionBooking._id
                          )}`
                        )
                      }
                      className="mt-4 inline-flex items-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
                    >
                      Pay Now - {formatCurrency(actionAmount)}
                    </button>
                  </>
                ) : (
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                    <CircleCheck className="h-4 w-4 text-green-600" />
                    You&apos;re all caught up — nothing needs your attention.
                  </div>
                )}
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
                      <th className="px-3 py-3">Service</th>
                      <th className="px-3 py-3">Technician</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Payment</th>
                    </tr>
                  </thead>

                  {/* TABLE BODY */}
                  <tbody>
                    {sortedBookings.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
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
                          {/* SERVICE */}
                          <td className="px-3 py-3">
                            {booking.serviceTitle || "N/A"}
                          </td>

                          {/* TECHNICIAN */}
                          <td className="px-3 py-3">
                            {booking.technicianName || "N/A"}
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
