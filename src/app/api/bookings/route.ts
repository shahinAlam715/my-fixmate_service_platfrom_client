import { NextResponse } from "next/server"
import { requireApiAuth, proxyBackend } from "@/lib/api"

// POST /api/bookings — create a repair request (customer only)
export async function POST(req: Request) {
  const auth = await requireApiAuth("customer")
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 })
  }

  return proxyBackend("/bookings", auth.token, { method: "POST", body })
}
