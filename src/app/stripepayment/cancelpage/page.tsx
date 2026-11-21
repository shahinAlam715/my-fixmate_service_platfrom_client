import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

// Stripe redirects here when the customer abandons checkout.
// Nothing was charged, so this is a static informational page.

type SearchParams = Promise<{ booking_id?: string }>;

export default async function PaymentCancelPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { booking_id } = await searchParams;

  const retryHref = booking_id
    ? `/stripepayment?id=${encodeURIComponent(booking_id)}`
    : "/customer/dashboard/my-bookings";

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <XCircle className="h-9 w-9 text-gray-500" />
        </div>

        <h1 className="mt-5 text-2xl font-bold tracking-tight">
          Payment Cancelled
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Your payment was cancelled and you were not charged. You can try
          again whenever you&apos;re ready.
        </p>

        <div className="mt-6 space-y-2">
          <Link
            href={retryHref}
            className={`${buttonVariants({
              className:
                "w-full bg-orange-600 text-white hover:bg-orange-700",
            })}`}
          >
            {booking_id ? "Try Payment Again" : "Back to My Bookings"}
          </Link>

          <Link
            href="/customer/dashboard/my-bookings"
            className={`${buttonVariants({ variant: "outline" })} w-full`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
