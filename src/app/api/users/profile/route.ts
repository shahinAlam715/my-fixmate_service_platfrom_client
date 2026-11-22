import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { requireApiAuth } from "@/lib/api"

// PATCH /api/users/profile — update the signed-in user's profile via
// better-auth. Only these fields are forwarded on purpose: better-auth
// treats every `input: true` additional field (including `role`) as
// client-writable, so the body must never be passed through as-is.
export async function PATCH(req: Request) {
  const gate = await requireApiAuth()
  if (!gate.ok) {
    return NextResponse.json({ message: gate.message }, { status: gate.status })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 })
  }

  const { name, image, phone, area, bio } = body as {
    name?: string
    image?: string
    phone?: string
    area?: string
    bio?: string
  }

  try {
    const updated = await auth.api.updateUser({
      body: { name, image, phone, area, bio },
      headers: await headers(),
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Profile update error:", error)

    const err = error as { status?: number; body?: { message?: string } }

    return NextResponse.json(
      { message: err.body?.message || "Failed to update profile" },
      { status: err.status && err.status < 600 ? err.status : 500 }
    )
  }
}
