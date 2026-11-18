
import Link from "next/link";
import {
  Search,
  CalendarCheck,
  Wrench,
  CreditCard,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Choose a Service",
    description:
      "Select your device and describe the problem you are facing.",
    icon: Search,
  },
  {
    number: "02",
    title: "Book a Technician",
    description:
      "Find a verified technician and schedule your preferred time.",
    icon: CalendarCheck,
  },
  {
    number: "03",
    title: "Get It Repaired",
    description:
      "Our technician fixes your device with professional care.",
    icon: Wrench,
  },
  {
    number: "04",
    title: "Pay After Service",
    description:
      "Check your device and complete the payment after the repair.",
    icon: CreditCard,
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-orange-50 px-4 py-16 text-center sm:py-20">
        <div className="mx-auto max-w-3xl">
          <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600">
            Simple & Reliable Repair Service
          </span>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            How <span className="text-orange-600">FixMate</span> Works
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
            Getting your electronic devices repaired is now easier than ever.
            Follow four simple steps to connect with trusted technicians.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Get Your Device Fixed in 4 Easy Steps
          </h2>
          <p className="mt-3 text-gray-500">
            A simple process designed to save your time.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
                    <Icon size={26} />
                  </div>

                  <span className="text-3xl font-bold text-gray-200">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-bold text-gray-900">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-500">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why FixMate */}
      <section className="bg-gray-50 px-4 py-14 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center">
          <div className="rounded-full bg-orange-100 p-4 text-orange-600">
            <ShieldCheck size={32} />
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Why Choose FixMate?
          </h2>

          <p className="max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
            We connect customers with verified technicians, provide an easy
            booking experience, and make device repairs more convenient and
            reliable.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Verified Technicians",
              "Easy Booking",
              "Transparent Pricing",
              "Secure Payment",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-gray-700"
              >
                ✓ {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Ready to Fix Your Device?
        </h2>

        <p className="mt-3 text-gray-500">
          Find the right technician and book your repair today.
        </p>

        <Link
          href="/services"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700"
        >
          Explore Services
          <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}
