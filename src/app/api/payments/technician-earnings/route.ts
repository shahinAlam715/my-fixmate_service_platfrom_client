import { NextResponse } from "next/server"
import { requireApiAuth, proxyBackend } from "@/lib/api"

// GET /api/payments/technician-earnings — the signed-in technician's
// earnings. Identity comes from the session, never from a query parameter.
export async function GET() {
  const auth = await requireApiAuth("technician")
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status })
  }

  return proxyBackend("/payments/technician-earnings", auth.token)
}
