"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, ReceiptText } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { getTechnicianEarnings, type IPayment } from "@/all-api/paymentapi";

// ================================
// HELPERS
// ================================

/** $55 — no decimals for whole amounts, up to 2 otherwise. */
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

/** 02 Nov 2026 */
const formatDate = (value?: string | Date) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/** pi_3Qx81aB… — keeps the table tidy, full id available on hover. */
const shortTransactionId = (id?: string) => {
  if (!id) return "—";
  return id.length > 14 ? `${id.slice(0, 12)}…` : id;
};

/** First letter of up to two name parts. */
const getInitials = (name?: string) => {
  const parts = name?.trim().split(/\s+/) ?? [];

  if (parts.length === 0) return "TE";

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
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

// ================================
// TECHNICIAN EARNINGS PAGE
// ================================

export default function MyEarningsPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const technicianEmail = session?.user?.email;

  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ================================
  // LOAD TECHNICIAN EARNINGS
  // ================================
  useEffect(() => {
    if (sessionLoading || !technicianEmail) return;

    let cancelled = false;

    getTechnicianEarnings(technicianEmail)
      .then((payload: unknown) => {
        if (cancelled) return;

        setPayments(normalizePayments(payload));
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        console.error("Technician earnings error:", err);

        setPayments([]);
        setError(
          err instanceof Error ? err.message : "Failed to fetch earnings."
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [technicianEmail, sessionLoading]);

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
            My Earnings
          </h1>

          <div className="rounded-xl border border-[#e3eaf2] bg-white px-5 py-8 text-center text-sm text-gray-500">
            Please sign in to view your earnings.
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

          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] whitespace-nowrap text-gray-600">
            Technician
          </span>
        </div>
      </header>

      {/* ================================
          MAIN CONTENT
      ================================ */}
      <main className="px-4 py-5 sm:px-5 sm:py-6">
        {/* TITLE */}
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-[#0b1f44] sm:text-3xl">
          My Earnings
        </h1>

        {/* ================================
            LOAD ERROR
        ================================ */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ================================
            EARNINGS TABLE
        ================================ */}
        <div className="overflow-hidden rounded-xl border border-[#e3eaf2] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              {/* TABLE HEADER */}
              <thead>
                <tr className="bg-[#f8fafc] text-[9px] font-medium uppercase tracking-wide text-[#0b1f44]">
                  <th className="px-3 py-3">Service</th>
                  <th className="px-3 py-3">Technician</th>
                  <th className="px-3 py-3">Amount</th>
                  <th className="px-3 py-3">Transaction ID</th>
                  <th className="px-3 py-3">Paid On</th>
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading earnings...
                      </div>
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
                        <ReceiptText className="h-6 w-6 text-gray-300" />
                        No earnings yet.
                      </div>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="border-t border-[#e8edf3] text-[10px] transition hover:bg-gray-50"
                    >
                      {/* SERVICE */}
                      <td className="px-3 py-3">
                        {payment.serviceTitle || "N/A"}
                      </td>

                      {/* TECHNICIAN */}
                      <td className="px-3 py-3">
                        {payment.technicianName || "N/A"}
                      </td>

                      {/* AMOUNT */}
                      <td className="whitespace-nowrap px-3 py-3 font-medium">
                        {formatCurrency(Number(payment.amount) || 0)}
                      </td>

                      {/* TRANSACTION ID */}
                      <td
                        className="whitespace-nowrap px-3 py-3 font-mono text-[9px] text-slate-600"
                        title={payment.transactionId || undefined}
                      >
                        {shortTransactionId(payment.transactionId)}
                      </td>

                      {/* PAID ON */}
                      <td className="whitespace-nowrap px-3 py-3">
                        {formatDate(payment.paidAt)}
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
