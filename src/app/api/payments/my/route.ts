import { NextResponse } from "next/server"
import { requireApiAuth, proxyBackend } from "@/lib/api"

// GET /api/payments/my — the signed-in customer's payment history.
// Identity comes from the session, never from a query parameter.
export async function GET() {
  const auth = await requireApiAuth("customer")
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status })
  }

  return proxyBackend("/payments/my-payments", auth.token)
}
