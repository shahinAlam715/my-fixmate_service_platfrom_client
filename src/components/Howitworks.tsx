
import {
  Search,
  CalendarCheck,
  Wrench,
  CreditCard,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Choose a Service",
    description: "Select your device and tell us what needs to be fixed.",
    icon: Search,
  },
  {
    number: "02",
    title: "Book a Technician",
    description: "Choose a verified technician and schedule your service.",
    icon: CalendarCheck,
  },
  {
    number: "03",
    title: "Get It Repaired",
    description: "Our expert technician repairs your device professionally.",
    icon: Wrench,
  },
  {
    number: "04",
    title: "Pay After Service",
    description: "Check your device and pay after the repair is complete.",
    icon: CreditCard,
  },
];

export default function Howitworks() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-orange-600">
            Simple Process
          </span>

          <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
            How FixMate Works
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            Get your devices repaired in just four simple steps.
            Fast, easy and reliable service at your fingertips.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="rounded-xl border border-gray-200 p-6 transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-orange-100 p-3 text-orange-600">
                    <Icon size={25} />
                  </div>

                  <span className="text-3xl font-bold text-gray-200">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-bold text-gray-900">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
