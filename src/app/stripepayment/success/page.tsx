import { CheckoutVerify } from "@/all-api/paymentapi";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  Receipt,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default async function Success({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    throw new Error("Please provide a valid session_id");
  }

  const session = await stripe.checkout.sessions.retrieve(session_id);

  // Payment session open থাকলে
  if (session.status === "open") {
    return redirect("/");
  }

  // Payment successfully completed হলে
  if (session.status === "complete" && session.payment_status === "paid") {
    const result = await CheckoutVerify(session_id);

    console.log("Payment verification result:", result);

    const serviceName =
      session.metadata?.serviceName || "Repair Service";

    const bookingId =
      session.metadata?.bookingId || "N/A";

    const amount =
      session.amount_total !== null
        ? (session.amount_total / 100).toFixed(2)
        : "0.00";

    const currency = session.currency?.toUpperCase() || "USD";

    return (
      <section className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg overflow-hidden rounded-2xl border bg-card shadow-xl">

          {/* Success Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-green-600 to-emerald-700 px-6 py-10 text-center text-white">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/20">
              <CheckCircle2 className="h-12 w-12" />
            </div>

            <h1 className="mt-5 text-3xl font-bold">
              Payment Successful!
            </h1>

            <p className="mt-2 text-sm text-green-50">
              Your payment has been completed successfully.
            </p>
          </div>

          {/* Payment Amount */}
          <div className="px-6 pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Amount Paid
            </p>

            <h2 className="mt-2 text-4xl font-bold tracking-tight text-green-600">
              {currency} {amount}
            </h2>
          </div>

          {/* Payment Details */}
          <div className="mx-6 mt-6 rounded-xl border bg-muted/30 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Payment Details</h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">
                  Service
                </span>

                <span className="text-right font-medium">
                  {serviceName}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">
                  Booking ID
                </span>

                <span className="break-all text-right font-medium">
                  {bookingId}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">
                  Transaction
                </span>

                <span className="break-all text-right font-medium">
                  {session.payment_intent &&
                  typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : session.id}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">
                  Payment Status
                </span>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Paid
                </span>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

            <div>
              <p className="text-sm font-semibold text-green-800 dark:text-green-400">
                Secure Payment
              </p>

              <p className="mt-1 text-xs text-green-700 dark:text-green-300">
                Your transaction was securely processed through Stripe.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="space-y-3 px-6 py-6">
            <Link
              href="/customer/dashboard/my-bookings"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
            >
              View My Bookings
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/"
              className="flex w-full items-center justify-center rounded-xl border px-5 py-3 font-medium transition hover:bg-muted"
            >
              Back to Home
            </Link>
          </div>

          {/* Bottom Note */}
          <div className="border-t px-6 py-4 text-center">
            <p className="text-xs text-muted-foreground">
              Thank you for choosing Fixmate for your repair service.
            </p>
          </div>

        </div>
      </section>
    );
  }

  // Payment successful না হলে
  return redirect("/");
}