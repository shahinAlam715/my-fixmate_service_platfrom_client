import { NextResponse } from "next/server"
import { requireApiAuth, proxyBackend } from "@/lib/api"

// GET /api/admin/bookings — every booking (admin only).
// The backend verifies the admin email passed as `email`.
export async function GET() {
  const auth = await requireApiAuth("admin")
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status })
  }

  const email = auth.session.user.email
  if (!email) {
    return NextResponse.json({ message: "Account has no email" }, { status: 400 })
  }

  return proxyBackend(
    `/bookings/admin?email=${encodeURIComponent(email)}`,
    auth.token
  )
}
