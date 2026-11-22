"use server"

import { callApi } from "@/lib/call-api"

// ===============================
// GET ALL APPROVED SERVICES
// ===============================

// Query params supported by the backend GET /services endpoint
export interface IServiceQuery {
  category?: string;
  search?: string;
  serviceMode?: string;
  sort?: string;

  // Featured services
  approvalStatus?: string;
  isAvailable?: boolean;
  limit?: number;
}

export const Allservicedata = async (params?: IServiceQuery) => {

 

  const query = new URLSearchParams();

  if (params?.category) query.set("category", params.category);
  if (params?.search) query.set("search", params.search);
  if (params?.serviceMode) query.set("serviceMode", params.serviceMode);
  if (params?.sort) query.set("sort", params.sort);

  if (params?.approvalStatus)
    query.set("approvalStatus", params.approvalStatus);

  if (params?.isAvailable !== undefined)
    query.set("isAvailable", String(params.isAvailable));

  if (params?.limit !== undefined)
    query.set("limit", String(params.limit));

  const queryString = query.toString();

  // jwt-secured /api layer (session forwarded, see src/lib/api.ts)
  const api = `/api/services${queryString ? `?${queryString}` : ""}`

  const res = await callApi(api);

  if (!res.ok) {
    throw new Error("Failed to fetch services.");
  }

  return res.json();
};

// export const Allservicedata = async (params?: IServiceQuery) => {
//   const query = new URLSearchParams()

//   if (params?.category) query.set("category", params.category)
//   if (params?.search) query.set("search", params.search)
//   if (params?.serviceMode) query.set("serviceMode", params.serviceMode)
//   if (params?.sort) query.set("sort", params.sort)

//   const queryString = query.toString()

//   const res = await fetch(
//     `${getServerUrl()}/services${queryString ? `?${queryString}` : ""}`,
//     {
//       cache: "no-store",
//     }
//   )

//   if (!res.ok) {
//     throw new Error("Failed to fetch services.")
//   }

//   return res.json()
// }

// ===============================
// GET SINGLE SERVICE
// ===============================

export const SingleServicedata = async (id: string) => {
  const api = `/api/services/${id}`

  const res = await callApi(api);
  

  if (!res.ok) {
    throw new Error("Failed to fetch service details.")
  }

  return res.json()
}


// ===============================
// ADD SERVICE
// ===============================

export const AddService = async (data: Record<string, unknown>) => {
  const res = await callApi("/api/services", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error("Failed to add service.")
  }

  return res.json()
}

// ===============================
// UPDATE SERVICE
// ===============================

export const UpdateService = async (
  id: string,
  data: Record<string, unknown>
) => {
  const res = await callApi(`/api/services/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error("Failed to update service.")
  }

  return res.json()
}

// ===============================
// DELETE SERVICE
// ===============================

export const DeleteService = async (id: string) => {
  const res = await callApi(`/api/services/${id}`, {
    method: "DELETE",
  })

  if (!res.ok) {
    throw new Error("Failed to delete service.")
  }

  return res.json()
}

// ===============================
// UPDATE AVAILABILITY
// ===============================

export const UpdateServiceAvailability = async (
  id: string,
  isAvailable: boolean
) => {
  const res = await callApi(`/api/services/${id}/availability`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isAvailable }),
  })

  if (!res.ok) {
    throw new Error("Failed to update service availability.")
  }

  return res.json()
}


// Get Pending Services
export const GetPendingServices = async () => {
  const res = await callApi("/api/services/pending")

  if (!res.ok) {
    throw new Error("Failed to get pending services")
  }

  return res.json()
}

// Get All Services (admin — any approval status)
export const GetAllServices = async () => {
  const res = await callApi("/api/services/all")

  if (!res.ok) {
    throw new Error("Failed to get all services")
  }

  return res.json()
}

// Approve or Reject Service
export const UpdateServiceApproval = async (
  id: string,
  approvalStatus: "approved" | "rejected"
) => {
  const res = await callApi(`/api/admin/services/${id}/approval`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ approvalStatus }),
  })

  const result = await res.json()

  if (!res.ok) {
    throw new Error(result.message || "Failed to update approval")
  }

  return result
}