// src/lib/api.ts

// ================================
// API BASE URL
// ================================
const API_URL = process.env.NEXT_PUBLIC_SERVER_URL;

// ================================
// Booking Type
// ================================
export interface IBooking {
  _id: string;

  serviceId: string;
  serviceTitle: string;
  serviceImage: string;
  category: string;
  basePrice: number;

  technicianName: string;
  technicianEmail: string;

  customerName: string;
  customerEmail: string;
  customerPhone: string;

  address: string;
  preferredDate: string | Date;
  problemDescription: string;

  status:
    | "requested"
    | "accepted"
    | "rejected"
    | "in-progress"
    | "completed"
    | "cancelled";

  finalAmount: number;

  paymentStatus: "unpaid" | "paid";

  createdAt: string | Date;
  updatedAt?: string | Date;
}

// ================================
// Booking Request Type
// ================================
export interface ICreateBooking {
  serviceId: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  preferredDate: string;
  problemDescription: string;
}

// ================================
// API Fetch Helper
// ================================
const bookingFetch = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  if (!API_URL) {
    throw new Error("Server URL is missing");
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
};

// ================================
// CREATE BOOKING
// POST /bookings
// ================================
export const createBooking = async (
  bookingData: ICreateBooking
) => {
  return bookingFetch("/bookings", {
    method: "POST",
    body: JSON.stringify(bookingData),
  });
};

// ================================
// GET CUSTOMER BOOKINGS
// GET /bookings/my-bookings?customerEmail=
// ================================
export const getMyBookings = async (customerEmail: string) => {
  const res = await fetch(
    `${API_URL}/bookings/my-bookings?customerEmail=${encodeURIComponent(customerEmail)}`
  );

  if (!res.ok) {
    throw new Error("Failed to get my bookings");
  }

  return res.json();
};

// ================================
// GET TECHNICIAN BOOKINGS
// GET /bookings/technician
// ================================

export const getTechnicianBookings = async (
  technicianEmail: string
): Promise<IBooking[]> => {
  return bookingFetch(
    `/bookings/technician?technicianEmail=${encodeURIComponent(
      technicianEmail
    )}`
  );
};

// export const updateBookingStatus = async (
//   bookingId: string,
//   data: { status: string }
// ) => {
//   return bookingFetch(`/bookings/${bookingId}/status`, {
//     method: "PATCH",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });
// };


// ================================
// UPDATE BOOKING STATUS
// PATCH /bookings/:id/status
// ================================
export interface IUpdateBookingStatus {
  status: "accepted" | "rejected" | "in-progress" | "completed";
  finalAmount?: number;
}

// export const updateBookingStatus = async (
//   bookingId: string,
//   statusData: IUpdateBookingStatus
// ) => {
//   return bookingFetch(`/bookings/${bookingId}/status`, {
//     method: "PATCH",
//     body: JSON.stringify(statusData),
//   });
// };


export const updateBookingStatus = async (
  bookingId: string,
  data: { status: string }
) => {
  return bookingFetch(`/bookings/${bookingId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

// ================================
// CANCEL BOOKING
// PATCH /bookings/:id/cancel
// ================================
export const cancelBooking = async (
  bookingId: string,
  customerEmail: string
) => {
  return bookingFetch(`/bookings/${bookingId}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ customerEmail }),
  });
};



// admin api

// ================================
// ADMIN - GET ALL BOOKINGS
// GET /bookings/admin
// ================================

export const getAllBookings = async (
  adminEmail: string
): Promise<IBooking[]> => {
  return bookingFetch(
    `/bookings/admin?email=${encodeURIComponent(adminEmail)}`
  );
};

// ================================
// ADMIN - ACCEPT REJECTED BOOKING
// PATCH /bookings/:id/admin-accept
// ================================

export const adminAcceptRejectedBooking = async (
  bookingId: string,
  adminEmail: string
) => {
  return bookingFetch(`/bookings/${bookingId}/admin-accept`, {
    method: "PATCH",
    body: JSON.stringify({ adminEmail }),
  });
};