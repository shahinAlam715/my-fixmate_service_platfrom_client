import { NextResponse } from "next/server"
import { requireApiAuth, proxyBackend } from "@/lib/api"

// GET /api/services/pending — services awaiting approval (admin only).
// Static segment: Next matches this before the dynamic /api/services/[id].
export async function GET() {
  const auth = await requireApiAuth("admin")
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status })
  }

  return proxyBackend("/services/pending", auth.token)
}
