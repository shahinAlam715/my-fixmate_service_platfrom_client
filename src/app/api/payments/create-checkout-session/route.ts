import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { requireApiAuth } from "@/lib/api"

// POST /api/payments/create-checkout-session — Stripe Checkout for a
// completed booking. Requires a session; customerEmail always comes
// from the session, never from the client.
export async function POST(req: Request) {
  const gate = await requireApiAuth()
  if (!gate.ok) {
    return NextResponse.json({ message: gate.message }, { status: gate.status })
  }

  const body = await req.json().catch(() => null)

  const amount = Number(body?.amount)
  const bookingId =
    typeof body?.bookingId === "string" ? body.bookingId.trim() : ""
  const serviceName =
    typeof body?.serviceName === "string" && body.serviceName.trim()
      ? body.serviceName.trim()
      : "Repair Service"
  const customerEmail = gate.session.user.email

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ message: "Invalid amount" }, { status: 400 })
  }

  if (!bookingId) {
    return NextResponse.json({ message: "Booking ID is required" }, { status: 400 })
  }

  if (!customerEmail) {
    return NextResponse.json(
      { message: "Account has no email" },
      { status: 400 }
    )
  }

  const headersList = await headers()
  const origin =
    headersList.get("origin") ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000"

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            product_data: {
              name: serviceName,
            },
            unit_amount: Math.round(amount * 100),
          },
        },
      ],

      customer_email: customerEmail,

      metadata: {
        bookingId,
        serviceName,
        customerEmail,
      },

      success_url: `${origin}/stripepayment/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${origin}/stripepayment/cancelpage?booking_id=${encodeURIComponent(
        bookingId
      )}`,
    })

    if (!session.url) {
      return NextResponse.json(
        { message: "Checkout URL not found" },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Checkout session error:", error)

    return NextResponse.json(
      { message: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
