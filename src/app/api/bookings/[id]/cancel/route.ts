import { NextResponse } from "next/server"
import { requireApiAuth, proxyBackend } from "@/lib/api"

// PATCH /api/bookings/:id/cancel — customer cancels their own request.
// customerEmail is always taken from the session, never from the body.
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth("customer")
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status })
  }

  const { id } = await params

  return proxyBackend(`/bookings/${id}/cancel`, auth.token, {
    method: "PATCH",
    body: { customerEmail: auth.session.user.email },
  })
}
