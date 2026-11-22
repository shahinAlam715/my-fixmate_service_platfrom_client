"use server"

import { callApi } from "@/lib/call-api"

// GET /api/services/technician — the signed-in technician's own
// listings (the route derives the email from the session).
export const Uniqtechniciandata = async () => {
  const res = await callApi("/api/services/technician", {
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch technician services.")
  }

  return await res.json()
}
