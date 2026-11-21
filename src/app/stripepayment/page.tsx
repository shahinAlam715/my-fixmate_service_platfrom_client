"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Lock, PackageOpen } from "lucide-react";
import toast from "react-hot-toast";

import { getMyBookings, type IBooking } from "@/all-api/bookingapi";
import { Button, buttonVariants } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

// ===============================
// Helpers
// ===============================

const formatAmount = (booking: IBooking) => {
  const amount = booking.finalAmount || booking.basePrice || 0;
  return `$${amount}`;
};

// ===============================
// Stripe payment page
// ===============================

export default function StripePaymentPage() {
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled");

  if (canceled) {
    console.log(
      "Order canceled -- continue to shop around and check out when you're ready.",
    );
  }

  const id = searchParams.get("id");

  const { data: session, isPending: sessionLoading } = useSession();
  const customerEmail = session?.user?.email;

  const [booking, setBooking] = useState<IBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isPaying, setIsPaying] = useState(false);

  // Load the booking from my-bookings (backend has no GET /bookings/:id)
  useEffect(() => {
    if (sessionLoading || !customerEmail) return;

    let cancelled = false;

    getMyBookings(customerEmail)
      .then((payload: unknown) => {
        if (cancelled) return;

        const list: IBooking[] = Array.isArray(payload)
          ? (payload as IBooking[])
          : payload &&
              typeof payload === "object" &&
              Array.isArray((payload as { data?: unknown }).data)
            ? ((payload as { data: IBooking[] }).data)
            : [];

        const found = list.find((item) => item._id === id) ?? null;

        if (!found) {
          setError("Booking not found.");
        } else if (found.paymentStatus === "paid") {
          // Already paid — nothing to collect
          setError("This booking is already paid.");
        } else {
          setBooking(found);
          setError(null);
        }

        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        console.error("Failed to load booking for payment:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load booking.",
        );
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, customerEmail, sessionLoading]);

  const handlePay = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isPaying || !booking) return;

    setIsPaying(true);

    try {
      const res = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: booking.finalAmount || booking.basePrice,
          bookingId: booking._id,
          serviceName: booking.serviceTitle,
          customerEmail: customerEmail || "",
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Could not start checkout.");
      }

      window.location.href = data.url as string;
    } catch (err: unknown) {
      console.error("Payment error:", err);
      toast.error(err instanceof Error ? err.message : "Payment failed.");
      setIsPaying(false);
    }
  };

  // ===============================
  // States
  // ===============================

  if (sessionLoading || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed px-4 py-14 text-center">
          <PackageOpen className="h-12 w-12 text-muted-foreground" />

          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Payment unavailable</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>

          <Link
            href="/customer/dashboard/my-bookings"
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  // ===============================
  // UI
  // ===============================

  return (
    <div className="mx-auto flex min-h-[85vh] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:py-16">
      {/* Main Payment Container */}
      <div className="w-full max-w-6xl">
        {/* Back */}
        <Link
          href="/customer/dashboard/my-bookings"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Bookings
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
          {/* Left — Payment Card */}
          <div className="min-h-[500px] rounded-2xl border bg-card p-8 shadow-sm sm:p-10">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Payment</h1>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                <Lock className="h-3.5 w-3.5" />
                Secure
              </span>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              Pay for{" "}
              <span className="font-medium text-foreground">
                {booking.serviceTitle || "Repair Service"}
              </span>
            </p>

            <form onSubmit={handlePay} className="mt-8 space-y-6">
              {/* Order Summary */}
              <aside className="lg:sticky lg:top-4 lg:self-start">
                <div className="rounded-2xl border bg-card p-7 shadow-sm">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Order Summary
                  </h2>

                  <dl className="mt-6 space-y-5 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">Service</dt>
                      <dd className="text-right font-medium">
                        {booking.serviceTitle || "Repair Service"}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">Technician</dt>
                      <dd className="text-right font-medium">
                        {booking.technicianName || "—"}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">Status</dt>
                      <dd>
                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Completed
                        </span>
                      </dd>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t pt-5">
                      <dt className="font-semibold">Total</dt>
                      <dd className="text-xl font-bold">
                        {formatAmount(booking)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </aside>

              {/* Checkout Button */}
              <section>
                <Button
                  type="submit"
                  role="link"
                  disabled={isPaying}
                  className="h-12 w-full rounded-xl bg-orange-600 text-base font-semibold text-white hover:bg-orange-700"
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Checkout ${formatAmount(booking)}`
                  )}
                </Button>
              </section>

              {/* Security Notice */}
              <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                Payments are encrypted and processed securely.
              </p>
            </form>
          </div>

          {/* Right — Order Summary space */}
        </div>
      </div>
    </div>
  );
}