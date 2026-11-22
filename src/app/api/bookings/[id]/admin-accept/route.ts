import { NextResponse } from "next/server"
import { requireApiAuth, proxyBackend } from "@/lib/api"

// PATCH /api/bookings/:id/admin-accept — admin accepts a rejected
// booking. The backend derives the admin from the Bearer token.
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth("admin")
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status })
  }

  const { id } = await params

  return proxyBackend(`/bookings/${id}/admin-accept`, auth.token, {
    method: "PATCH",
  })
}
