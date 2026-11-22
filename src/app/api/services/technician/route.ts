import { NextResponse } from "next/server"
import { requireApiAuth, proxyBackend } from "@/lib/api"

// GET /api/services/technician — the signed-in technician's own
// listings. The email in the backend path comes from the session
// (the backend also compares it against the Bearer token's user),
// never from anything the client sends.
export async function GET() {
  const auth = await requireApiAuth("technician")
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status })
  }

  const email = auth.session.user.email

  return proxyBackend(
    `/services/technician/${encodeURIComponent(email)}`,
    auth.token
  )
}
