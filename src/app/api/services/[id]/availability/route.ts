import { NextResponse } from "next/server"
import { requireApiAuth, proxyBackend } from "@/lib/api"

// PATCH /api/services/:id/availability — technician toggles their
// own service's availability (the backend enforces ownership).
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth("technician")
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 })
  }

  const { id } = await params

  return proxyBackend(`/services/${id}/availability`, auth.token, {
    method: "PATCH",
    body,
  })
}
