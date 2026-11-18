
"use client";

import * as React from "react";
import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "./ui/button";

interface BannerSlide {
  eyebrow: string;
  title: string;
  description: string;
  job: {
    title: string;
    status: string;
    statusClassName: string;
    meta: string;
  };
}

const BANNER_SLIDES: BannerSlide[] = [
  {
    eyebrow: "Pay only after the job is done",
    title: "Broken Device? Get It Fixed by Verified Technicians",
    description:
      "Book phone, laptop and appliance repairs, track each step, and pay when the work is delivered.",
    job: {
      title: "iPhone Screen Replacement",
      status: "In Progress",
      statusClassName: "bg-amber-100 text-amber-700",
      meta: "Rafiq Hasan · Est. 2 - 3 hours",
    },
  },
  {
    eyebrow: "Same-day service at your doorstep",
    title: "AC Not Cooling? Book a Verified Technician Today",
    description:
      "Schedule AC servicing, gas refill, or deep cleaning in minutes and follow the job until it is done.",
    job: {
      title: "AC Gas Refill & Service",
      status: "Scheduled",
      statusClassName: "bg-blue-100 text-blue-700",
      meta: "Imran Hossain · Today, 4:00 PM",
    },
  },
  {
    eyebrow: "100% service guarantee",
    title: "Laptop Acting Up? Get It Repaired Without Leaving Home",
    description:
      "Pick a trusted technician, watch the repair live, and release payment only when you are satisfied.",
    job: {
      title: "Laptop Battery Replacement",
      status: "Completed",
      statusClassName: "bg-green-100 text-green-700",
      meta: "Sadia Rahman · Took 45 min",
    },
  },
];

const CAROUSEL_OPTS = { loop: true };

const HEADING_CLASS =
  "mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl";

export default function Banner() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [selected, setSelected] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      setSelected(api.selectedScrollSnap());
    };

    api.on("select", handleSelect);
    api.on("reInit", handleSelect);

    return () => {
      api.off("select", handleSelect);
      api.off("reInit", handleSelect);
    };
  }, [api]);

  return (
    <section aria-label="Promotions" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <Carousel setApi={setApi} opts={CAROUSEL_OPTS}>
          <CarouselContent>
            {BANNER_SLIDES.map((slide, index) => {
              const Heading = index === 0 ? "h1" : "h2";

              return (
                <CarouselItem key={slide.title}>
                  <div className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
                    {/* Copy */}
                    <div className="flex flex-col justify-center">
                      <Badge className="self-start rounded-md bg-green-100 text-green-800">
                        {slide.eyebrow}
                      </Badge>

                      <Heading className={HEADING_CLASS}>
                        {slide.title}
                      </Heading>

                      <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600">
                        {slide.description}
                      </p>

                    <Button
                          className="shrink-0 bg-orange-600 max-h-15 max-w-35 text-white my-2 hover:bg-orange-700"
                        >
                          Find Service
                        </Button>

                    </div>

                    {/* Job Card */}
                    <div className="flex min-h-[260px] items-center justify-center rounded-2xl bg-orange-100 p-6 sm:min-h-[300px] sm:p-10">
                      <div className="w-full max-w-xs rounded-xl bg-white p-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] ring-1 ring-black/5">
                        <p className="text-sm font-semibold text-gray-900">
                          {slide.job.title}
                        </p>

                        <Badge
                          className={cn(
                            "mt-2 rounded-md",
                            slide.job.statusClassName
                          )}
                        >
                          {slide.job.status}
                        </Badge>

                        <p className="mt-3 text-xs text-gray-500">
                          {slide.job.meta}
                        </p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {/* Carousel Controls */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <CarouselPrevious className="static my-auto size-9" />

            {/* Navigation Dots */}
            <div className="flex items-center gap-2">
              {BANNER_SLIDES.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  aria-label={`Go to banner ${index + 1}`}
                  aria-current={selected === index}
                  onClick={() => api?.scrollTo(index)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    selected === index
                      ? "w-6 bg-gray-900"
                      : "w-2 bg-gray-300 hover:bg-gray-400"
                  )}
                />
              ))}
            </div>

            <CarouselNext className="static my-auto size-9" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
