// import { NextResponse } from 'next/server'
// import { headers } from 'next/headers'
// import { stripe } from '@/lib/stripe'
// // import { getuserSession } from '@/lib/core'

// // Creates a Stripe Checkout Session for a booking's final amount.
// // The browser is redirected to Stripe-hosted checkout; on return the
// // success page verifies the session and marks the booking paid.
// export async function POST(req: Request) {

//     // const session = getuserSession()

//   try {
//     const body = await req.json().catch(() => null)

//     const amount = Number(body?.amount)
//     const bookingId = typeof body?.bookingId === 'string' ? body.bookingId : ''
//     const serviceName =
//       typeof body?.serviceName === 'string' && body.serviceName.trim()
//         ? body.serviceName.trim()
//         : 'Repair Service'
//     const customerEmail =
//       typeof body?.customerEmail === 'string' ? body.customerEmail : ''

//     if (!Number.isFinite(amount) || amount <= 0) {
//       return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
//     }

//     if (!bookingId) {
//       return NextResponse.json({ error: 'Missing booking id' }, { status: 400 })
//     }

//     const headersList = await headers()
//     const origin =
//       headersList.get('origin') ||
//       process.env.BETTER_AUTH_URL?.trim() ||
//       'http://localhost:3000'

//     const session = await stripe.checkout.sessions.create({
//       mode: 'payment',
//       line_items: [
//         {
//           quantity: 1,
//           price_data: {
//             currency: 'usd',
//             product_data: {
//               name: serviceName,
//             },
//             unit_amount: Math.round(amount * 100),
//           },
//         },
//       ],
//       ...(customerEmail ? { customer_email: customerEmail } : {}),
//       metadata: {
//         bookingId,
//         serviceName,
//         customerEmail,
//       },
//       success_url: `${origin}/stripepayment/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${origin}/stripepayment/cancelpage?booking_id=${encodeURIComponent(bookingId)}`,
//     })

//     if (!session.url) {
//       throw new Error('Stripe did not return a checkout URL')
//     }

//     return NextResponse.json({ url: session.url })
//   } catch (err) {
//     const error = err instanceof Error ? err : new Error(String(err))
//     console.error('Checkout session error:', error)

//     return NextResponse.json({ error: error.message }, { status: 500 })
//   }
// }




import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const amount = Number(body?.amount);
    const bookingId =
      typeof body?.bookingId === "string" ? body.bookingId.trim() : "";

    const serviceName =
      typeof body?.serviceName === "string" && body.serviceName.trim()
        ? body.serviceName.trim()
        : "Repair Service";

    const customerEmail =
      typeof body?.customerEmail === "string"
        ? body.customerEmail.trim()
        : "";

    // Validate amount
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { message: "Invalid amount" },
        { status: 400 }
      );
    }

    // Validate booking ID
    if (!bookingId) {
      return NextResponse.json(
        { message: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Validate email
    if (!customerEmail) {
      return NextResponse.json(
        { message: "Customer email is required" },
        { status: 400 }
      );
    }

    const headersList = await headers();

    const origin =
      headersList.get("origin") ||
      process.env.BETTER_AUTH_URL ||
      "http://localhost:3000";

    // Create Stripe Checkout Session
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
    });

    if (!session.url) {
      return NextResponse.json(
        { message: "Checkout URL not found" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Checkout session error:", error);

    return NextResponse.json(
      { message: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
