
// ================================
// PAYMENT TYPES
// ================================

import { callApi } from "@/lib/call-api"

/** Shape of a payment document stored by the backend's payments collection. */
export interface IPayment {
  _id: string;
  bookingId: string;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  technicianName: string;
  technicianEmail: string;
  amount: number;
  currency: string;
  transactionId: string;
  stripeSessionId: string;
  paymentStatus: string;
  paidAt: string;
}

export const CheckoutVerify = async (session_id: string) => {
  // jwt-secured /api layer — the backend re-checks ownership against
  // the session email (src/app/api/payments/verify-session/route.ts)
  const res = await callApi("/api/payments/verify-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ session_id }),
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Payment verification failed");
  }

  return data;
};


// ================================
// GET CUSTOMER PAYMENTS
// GET /api/payments/my (email comes from the session)
// ================================

export const getMyPayments = async () => {
  const res = await callApi("/api/payments/my")

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.message || "Failed to fetch payment history")
  }

  return res.json();
};


// ================================
// GET ALL PAYMENTS
// ================================

export const getAllPayments = async () => {
  const res = await callApi("/api/admin/payments")

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.message || "Failed to fetch all payments")
  }

  return res.json();
};


// ========================================
// GET TECHNICIAN EARNINGS
// GET /api/payments/technician-earnings (email comes from the session)
// ========================================

export const getTechnicianEarnings = async () => {
  const res = await callApi("/api/payments/technician-earnings")

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.message || "Failed to fetch technician earnings")
  }

  return res.json();
};