
// ================================
// PAYMENT TYPES
// ================================

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
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  if (!serverUrl) {
    throw new Error("Server URL is missing");
  }

  const res = await fetch(`${serverUrl}/payments/verify-session`, {
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
// ================================

export const getMyPayments = async (email: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/payments/my-payments?email=${encodeURIComponent(email)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch payment history");
  }

  return res.json();
};


// ================================
// GET ALL PAYMENTS
// ================================

export const getAllPayments = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/payments/all-payments`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch all payments");
  }

  return res.json();
};


// ========================================
// GET TECHNICIAN EARNINGS
// ========================================

export const getTechnicianEarnings = async (email: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/payments/technician-earnings?email=${encodeURIComponent(email)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch technician earnings");
  }

  return res.json();
};