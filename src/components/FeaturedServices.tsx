
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  UserRound,
  Wrench,
} from "lucide-react";
import { Allservicedata } from "@/all-api/serviceapi";
import Image from "next/image";


// ================================
// SERVICE TYPE
// ================================
interface IFeaturedService {
  _id: string;
  title?: string;
  serviceTitle?: string;

  imageUrl?: string;
  serviceImage?: string;
  image?: string;

  category?: string;

  serviceMode?: string;
  mode?: string;

  price?: number;
  startingPrice?: number;
  basePrice?: number;

  technicianName?: string;
  providerName?: string;

  approvalStatus: string;
  isAvailable: boolean;

  createdAt: string | Date;
}

// ================================
// HELPERS
// ================================
function getServiceTitle(service: IFeaturedService) {
  return service.title || service.serviceTitle || "Repair Service";
}

function getServiceImage(service: IFeaturedService) {
  return service.imageUrl || service.serviceImage || service.image || "";
}

function getServicePrice(service: IFeaturedService) {
  return (
    service.startingPrice ??
    service.price ??
    service.basePrice ??
    0
  );
}

function getServiceMode(service: IFeaturedService) {
  return service.serviceMode || service.mode || "Service";
}

function getTechnicianName(service: IFeaturedService) {
  return service.technicianName || service.providerName || "Technician";
}

// ================================
// FEATURED SERVICES
// ================================
export default function FeaturedServices() {
  const [services, setServices] = useState<IFeaturedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================================
  // FETCH LATEST 6 SERVICES
  // ================================
  useEffect(() => {
    let cancelled = false;
console.log("feauters service");
    Allservicedata({
      approvalStatus: "approved",
      isAvailable: true,
      limit: 6,
      sort: "newest",
    })
      .then((data) => {
        if (cancelled) return;
        console.log(data);
        setServices(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        console.error("Featured services error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load featured services"
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* SECTION HEADER */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-600">
              Popular Repair Services
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Featured Services
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
              Explore our latest approved repair services and
              find the right technician for your device.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 transition hover:text-orange-700"
          >
            View All Services
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white"
              >
                <div className="aspect-[16/10] animate-pulse bg-gray-100" />

                <div className="flex flex-1 flex-col p-5">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                  <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                  <div className="mt-5 h-3 w-full animate-pulse rounded bg-gray-100" />
                  <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-gray-100" />

                  <div className="mt-auto pt-5">
                    <div className="h-10 animate-pulse rounded-xl bg-gray-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-10 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && services.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-12 text-center">
            <Wrench className="mx-auto h-8 w-8 text-gray-400" />

            <h3 className="mt-3 text-lg font-semibold text-gray-800">
              No Featured Services Yet
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Approved services will appear here when they become available.
            </p>
          </div>
        )}

        {/* SERVICE CARDS */}
        {!loading && !error && services.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const image = getServiceImage(service);

              return (
                <article
                  key={service._id}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
                >
                  {/* IMAGE */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    {image ? (
                      <Image
                        src={image}
                        alt={getServiceTitle(service)}
                        height={400}
                        width={400}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Wrench className="h-12 w-12 text-gray-400" />
                      </div>
                    )}

                    {/* CATEGORY */}
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-orange-600 shadow-sm">
                      {service.category || "General"}
                    </span>
                  </div>

                  {/* CARD CONTENT */}
                  <div className="flex flex-1 flex-col p-5">

                    {/* TITLE */}
                    <h3 className="line-clamp-1 text-lg font-bold text-gray-900">
                      {getServiceTitle(service)}
                    </h3>

                    {/* SERVICE MODE */}
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={16} className="shrink-0 text-orange-500" />
                      <span className="line-clamp-1">
                        {getServiceMode(service)}
                      </span>
                    </div>

                    {/* TECHNICIAN */}
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <UserRound size={16} className="shrink-0 text-orange-500" />
                      <span className="line-clamp-1">
                        {getTechnicianName(service)}
                      </span>
                    </div>

                    {/* PRICE */}
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <p className="text-xs text-gray-500">
                        Starting price
                      </p>

                      <p className="mt-1 text-xl font-bold text-orange-600">
                        ৳{getServicePrice(service).toLocaleString("en-BD")}
                      </p>
                    </div>

                    {/* VIEW DETAILS */}
                    <div className="mt-auto pt-5">
                      <Link
                        href={`/services/${service._id}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
                      >
                        View Details
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
