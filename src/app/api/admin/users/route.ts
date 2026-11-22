import { NextResponse } from "next/server"
import { requireApiAuth, proxyBackend } from "@/lib/api"

// GET /api/admin/users — all users (admin only)
export async function GET() {
  const auth = await requireApiAuth("admin")
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status })
  }

  return proxyBackend("/users", auth.token)
}
