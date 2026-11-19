import "server-only"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const backendurl = process.env.NEXT_PUBLIC_SERVER_URL

export const Uniqtechniciandata = async () => {
  if (!backendurl) {
    throw new Error("Server URL is missing.")
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const technicianEmail = session?.user?.email

  if (!technicianEmail) {
    return []
  }

  const res = await fetch(
    `${backendurl}/services/${encodeURIComponent(technicianEmail)}`,
    {
      cache: "no-store",
    }
  )

  if (!res.ok) {
    throw new Error("Failed to fetch technician services.")
  }

  return await res.json()
}