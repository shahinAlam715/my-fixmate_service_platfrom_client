// src/lib/api.ts

import { callApi } from "@/lib/call-api"

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
// Routes through this app's own JWT-secured /api/* handlers (see
// src/lib/api.ts), which derive identity from the session and
// forward the request to the backend.
const bookingFetch = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const res = await callApi(`/api${endpoint}`, {
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
// GET /api/bookings/my (email comes from the session)
// ================================
export const getMyBookings = async () => {
  return bookingFetch("/bookings/my");
};

// ================================
// GET TECHNICIAN BOOKINGS
// GET /api/bookings/technician (email comes from the session)
// ================================

export const getTechnicianBookings = async (): Promise<IBooking[]> => {
  return bookingFetch("/bookings/technician");
};

// ================================
// UPDATE BOOKING STATUS
// PATCH /bookings/:id/status
// ================================
export interface IUpdateBookingStatus {
  status: "accepted" | "rejected" | "in-progress" | "completed";
  finalAmount?: number;
}



export const updateBookingStatus = async (
  bookingId: string,
  data: { status: string; finalAmount?: number }
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
// PATCH /api/bookings/:id/cancel (customerEmail comes from the session)
// ================================
export const cancelBooking = async (bookingId: string) => {
  return bookingFetch(`/bookings/${bookingId}/cancel`, {
    method: "PATCH",
  });
};



// admin api

// ================================
// ADMIN - GET ALL BOOKINGS
// GET /api/admin/bookings (admin session enforced by the route)
// ================================

export const getAllBookings = async (): Promise<IBooking[]> => {
  return bookingFetch("/admin/bookings");
};

// ================================
// ADMIN - ACCEPT REJECTED BOOKING
// PATCH /api/bookings/:id/admin-accept (admin session enforced by the route)
// ================================

export const adminAcceptRejectedBooking = async (
  bookingId: string
) => {
  return bookingFetch(`/bookings/${bookingId}/admin-accept`, {
    method: "PATCH",
  });
};