import { NextResponse } from "next/server"
import { requireApiAuth, proxyBackend } from "@/lib/api"

// PATCH /api/admin/services/:id/approval — approve/reject a service
// (admin only). The backend validates the approvalStatus value.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth("admin")
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 })
  }

  const { id } = await params

  return proxyBackend(`/services/${id}/approval`, auth.token, {
    method: "PATCH",
    body,
  })
}
