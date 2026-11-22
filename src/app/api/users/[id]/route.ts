import { NextResponse } from "next/server"
import { requireApiAuth, proxyBackend } from "@/lib/api"

// DELETE /api/users/:id — admin deletes a user (the backend refuses
// self-deletion and validates the id).
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth("admin")
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status })
  }

  const { id } = await params

  return proxyBackend(`/users/${id}`, auth.token, { method: "DELETE" })
}
