import { NextResponse } from "next/server"
import { requireApiAuth, proxyBackend } from "@/lib/api"

// GET /api/bookings/my — the signed-in user's own bookings.
// Identity comes from the session, never from a query parameter.
export async function GET() {
  const auth = await requireApiAuth()
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status })
  }

  const email = auth.session.user.email
  if (!email) {
    return NextResponse.json({ message: "Account has no email" }, { status: 400 })
  }

  return proxyBackend(
    `/bookings/my-bookings?customerEmail=${encodeURIComponent(email)}`,
    auth.token
  )
}
