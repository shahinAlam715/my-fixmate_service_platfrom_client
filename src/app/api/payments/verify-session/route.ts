import { NextResponse } from "next/server"
import { requireApiAuth, proxyBackend } from "@/lib/api"

// POST /api/payments/verify-session — verify a Stripe session and mark
// the booking paid. The backend re-checks ownership against the
// signed-in session's email, so the body is passed through as-is.
export async function POST(req: Request) {
  const auth = await requireApiAuth("customer")
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 })
  }

  return proxyBackend("/payments/verify-session", auth.token, {
    method: "POST",
    body,
  })
}
