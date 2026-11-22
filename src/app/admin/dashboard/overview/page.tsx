"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { usersData } from "@/all-api/userapi";
import { GetPendingServices } from "@/all-api/serviceapi";
import { getAllPayments, type IPayment } from "@/all-api/paymentapi";

// ================================
// TYPES + HELPERS
// ================================

interface IUser {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
}

/** Pending-approval service row shown in the table. */
interface IPendingService {
  _id: string;
  title?: string;
  technicianName?: string;
}

/** Backend responds a plain array (or sometimes a `{ data: [...] }` envelope). */
const normalizeArray = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];

  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data: unknown }).data;
    if (Array.isArray(data)) return data as T[];
  }

  return [];
};

/** Backend responds `{ success, total, payments: [...] }` (or a bare array). */
const normalizePayments = (payload: unknown): IPayment[] => {
  if (Array.isArray(payload)) return payload as IPayment[];

  if (payload && typeof payload === "object") {
    const payments = (payload as { payments?: unknown }).payments;
    if (Array.isArray(payments)) return payments as IPayment[];
  }

  return [];
};

// ================================
// ADMIN OVERVIEW PAGE
// ================================

export default function OverviewPage() {
  const { data: session } = authClient.useSession();

  const [users, setUsers] = useState<IUser[]>([]);
  const [pendingServices, setPendingServices] = useState<IPendingService[]>([]);
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ================================
  // LOAD USERS + PENDING SERVICES + PAYMENTS
  // ================================
  useEffect(() => {
    let cancelled = false;

    Promise.all([usersData(), GetPendingServices(), getAllPayments()])
      .then(([usersPayload, pendingPayload, paymentsPayload]: [unknown, unknown, unknown]) => {
        if (cancelled) return;

        setUsers(normalizeArray<IUser>(usersPayload));
        setPendingServices(normalizeArray<IPendingService>(pendingPayload));
        setPayments(normalizePayments(paymentsPayload));
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        console.error("Admin overview error:", err);

        setUsers([]);
        setPendingServices([]);
        setPayments([]);
        setError(
          err instanceof Error ? err.message : "Failed to load the overview."
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ================================
  // STATS
  // ================================
  const totalUsers = users.length;

  const totalTechnicians = useMemo(
    () => users.filter((user) => user.role === "technician").length,
    [users]
  );

  const pendingCount = pendingServices.length;

  // ================================
  // REVENUE PER MONTH (last 6 months)
  // ================================
  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; label: string; total: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

      buckets.push({
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString("en-US", { month: "short" }),
        total: 0,
      });
    }

    const index = new Map(buckets.map((bucket, i) => [bucket.key, i]));

    payments.forEach((payment) => {
      if (payment.paymentStatus !== "paid") return;

      const date = new Date(payment.paidAt);
      if (Number.isNaN(date.getTime())) return;

      const bucketIndex = index.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (bucketIndex !== undefined) {
        buckets[bucketIndex].total += Number(payment.amount) || 0;
      }
    });

    return buckets;
  }, [payments]);

  const maxRevenue = Math.max(1, ...monthlyRevenue.map((b) => b.total));

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
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-200 text-xs font-semibold text-orange-800">
            {session?.user?.name?.charAt(0)?.toUpperCase() || "AD"}
          </div>

          <div className="min-w-0 leading-tight">
            <p className="truncate text-[11px] font-semibold text-[#0b1f44]">
              {session?.user?.name || "FixMate Admin"}
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
      <main className="px-4 py-5 sm:px-5 sm:py-6">
        {/* TITLE */}
        <h1 className="mb-4 rounded-md border border-blue-400/70 px-4 py-3 text-2xl font-bold tracking-tight text-[#0b1f44] sm:text-3xl">
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
                  {totalUsers}
                </p>
                <p className="mt-1 text-xs text-slate-500">Total Users</p>
              </div>

              <div className="rounded-xl border border-[#e3eaf2] bg-white px-4 py-4 sm:px-5 sm:py-5">
                <p className="text-3xl font-bold tracking-tight text-[#0b1f44]">
                  {totalTechnicians}
                </p>
                <p className="mt-1 text-xs text-slate-500">Total Technicians</p>
              </div>

              <div className="rounded-xl border border-[#e3eaf2] bg-white px-4 py-4 sm:px-5 sm:py-5">
                <p className="text-3xl font-bold tracking-tight text-[#0b1f44]">
                  {pendingCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">Pending Services</p>
              </div>
            </div>

            {/* ================================
                REVENUE CHART + PENDING SERVICES
            ================================ */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* REVENUE (USD) */}
              <div className="rounded-xl border border-[#e3eaf2] bg-white px-4 py-4 sm:px-5 sm:py-5">
                <h2 className="mb-4 text-sm font-semibold text-[#0b1f44]">
                  Revenue (USD)
                </h2>

                <div
                  className="flex h-36 items-end gap-2 sm:gap-3"
                  role="img"
                  aria-label="Revenue per month for the last six months"
                >
                  {monthlyRevenue.map((bucket, i) => {
                    const height =
                      bucket.total > 0
                        ? Math.max((bucket.total / maxRevenue) * 100, 12)
                        : 5;

                    return (
                      <div
                        key={bucket.key}
                        title={`${bucket.label}: $${bucket.total.toFixed(2)}`}
                        className={`flex-1 rounded-t ${
                          i === monthlyRevenue.length - 1
                            ? "bg-orange-600"
                            : "bg-[#0b1f44]"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* PENDING SERVICES TABLE */}
              <div className="overflow-hidden rounded-xl border border-[#e3eaf2] bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[360px] border-collapse text-left">
                    {/* TABLE HEADER */}
                    <thead>
                      <tr className="bg-[#f8fafc] text-[9px] font-medium uppercase tracking-wide text-[#0b1f44]">
                        <th className="px-3 py-3">Pending Service</th>
                        <th className="px-3 py-3">Technician</th>
                      </tr>
                    </thead>

                    {/* TABLE BODY */}
                    <tbody>
                      {pendingServices.length === 0 ? (
                        <tr>
                          <td
                            colSpan={2}
                            className="py-12 text-center text-sm text-gray-500"
                          >
                            No pending services.
                          </td>
                        </tr>
                      ) : (
                        pendingServices.map((service) => (
                          <tr
                            key={service._id}
                            className="border-t border-[#e8edf3] text-[10px] transition hover:bg-gray-50"
                          >
                            {/* SERVICE */}
                            <td className="px-3 py-3">
                              {service.title || "N/A"}
                            </td>

                            {/* TECHNICIAN */}
                            <td className="px-3 py-3">
                              {service.technicianName || "N/A"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
