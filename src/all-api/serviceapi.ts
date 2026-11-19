const backendurl = process.env.NEXT_PUBLIC_SERVER_URL

// export const postserviceData = async (data: object) => {
//   if (!backendurl) {
//     throw new Error("Server URL is missing.")
//   }

//   const res = await fetch(`${backendurl}/services`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   })

//   const result = await res.json()

//   if (!res.ok) {
//     throw new Error(result.message || "Failed to add service.")
//   }

//   return result
// }


// Common server-side API helper
const getServerUrl = () => {
  if (!backendurl) {
    throw new Error("Server URL is missing.")
  }

  return backendurl
}

// ===============================
// GET ALL APPROVED SERVICES
// ===============================

// Query params supported by the backend GET /services endpoint
export interface IServiceQuery {
  category?: string
  search?: string
  serviceMode?: string
  sort?: string
}

export const Allservicedata = async (params?: IServiceQuery) => {
  const query = new URLSearchParams()

  if (params?.category) query.set("category", params.category)
  if (params?.search) query.set("search", params.search)
  if (params?.serviceMode) query.set("serviceMode", params.serviceMode)
  if (params?.sort) query.set("sort", params.sort)

  const queryString = query.toString()

  const res = await fetch(
    `${getServerUrl()}/services${queryString ? `?${queryString}` : ""}`,
    {
      cache: "no-store",
    }
  )

  if (!res.ok) {
    throw new Error("Failed to fetch services.")
  }

  return res.json()
}

// ===============================
// GET SINGLE SERVICE
// ===============================

export const SingleServicedata = async (id: string) => {
  const res = await fetch(`${getServerUrl()}/services/${id}`, {
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch service details.")
  }

  return res.json()
}


// ===============================
// ADD SERVICE
// ===============================

export const AddService = async (data: Record<string, unknown>) => {
  const res = await fetch(`${getServerUrl()}/services`, {
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
  const res = await fetch(`${getServerUrl()}/services/${id}`, {
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
  const res = await fetch(`${getServerUrl()}/services/${id}`, {
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
  const res = await fetch(`${getServerUrl()}/services/${id}/availability`, {
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
  if (!backendurl) throw new Error("Server URL is missing.")

  const res = await fetch(`${backendurl}/services/pending`)

  if (!res.ok) {
    throw new Error("Failed to get pending services")
  }

  return res.json()
}

// Get All Services (admin — any approval status)
export const GetAllServices = async () => {
  const res = await fetch(`${getServerUrl()}/services/all`, {
    cache: "no-store",
  })

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
  if (!backendurl) throw new Error("Server URL is missing.")

  const res = await fetch(`${backendurl}/services/${id}/approval`, {
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