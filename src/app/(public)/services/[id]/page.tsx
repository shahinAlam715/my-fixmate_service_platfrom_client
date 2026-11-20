"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, PackageOpen } from "lucide-react"
import toast from "react-hot-toast"

import { SingleServicedata } from "@/all-api/serviceapi"
import { createBooking } from "@/all-api/bookingapi"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "@/lib/auth-client"

interface IService {
  _id: string
  title: string
  category: string
  basePrice: number
  image: string
  description?: string
  estimatedDuration?: string
  serviceMode?: string
  serviceArea?: string
  technicianName?: string
  technicianEmail?: string
}

interface IForm {
  phone: string
  address: string
  date: string
  description: string
}

const getInitials = (name?: string) =>
  (name || "T")
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <Skeleton className="mb-6 h-4 w-32" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="space-y-5">
          <Skeleton className="aspect-[16/9] w-full rounded-xl" />
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>

          <Skeleton className="h-20 rounded-xl" />
        </div>

        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </div>
  )
}

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: session, isPending: sessionLoading } = useSession()

  const [service, setService] = useState<IService | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [form, setForm] = useState<IForm>({
    phone: "",
    address: "",
    date: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const requestIdRef = useRef(0)

  // Fetch single service (backend only returns approved + available ones)
  useEffect(() => {
    const requestId = ++requestIdRef.current

    SingleServicedata(id)
      .then((data: unknown) => {
        if (requestId !== requestIdRef.current) return

        if (data && typeof data === "object" && "title" in data) {
          setService(data as IService)
          setError(null)
        } else {
          setService(null)
          setError("Service not found.")
        }

        setIsLoading(false)
      })
      .catch((err: unknown) => {
        if (requestId !== requestIdRef.current) return

        console.error("Failed to fetch service:", err)
        setService(null)
        setError(
          err instanceof Error ? err.message : "Failed to fetch service."
        )
        setIsLoading(false)
      })
  }, [id, reloadKey])

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    setReloadKey((key) => key + 1)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Booking request — POSTs to the backend /bookings endpoint.
 // ================================
// BOOKING REQUEST
// ================================
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (isSubmitting) return;

  // Check login
  if (sessionLoading) {
    toast.error("Please wait, session is loading.");
    return;
  }

  if (!session?.user?.email) {
    toast.error("Please login to request a repair.");
    return;
  }

  const phone = form.phone.trim();
  const address = form.address.trim();
  const description = form.description.trim();

  const today = new Date().toISOString().slice(0, 10);

  // Validate phone
  if (!phone) {
    toast.error("Please enter your phone number.");
    return;
  }

  if (!/^[0-9+\-\s]{7,}$/.test(phone)) {
    toast.error("Please enter a valid phone number.");
    return;
  }

  // Validate address
  if (!address) {
    toast.error("Please enter your address.");
    return;
  }

  // Validate date
  if (!form.date) {
    toast.error("Please choose a preferred date.");
    return;
  }

  if (form.date < today) {
    toast.error("Please choose today or a later date.");
    return;
  }

  // Validate description
  if (description.length < 20) {
    toast.error(
      "Problem description must be at least 20 characters."
    );
    return;
  }

  setIsSubmitting(true);

  try {
    const result = await createBooking({
      serviceId: id,
      customerEmail: session.user.email,
      customerPhone: phone,
      address,
      preferredDate: form.date,
      problemDescription: description,
    });

    toast.success(
      result?.message || "Booking request sent successfully!"
    );

    setForm({
      phone: "",
      address: "",
      date: "",
      description: "",
    });
  } catch (err: unknown) {
    console.error("Failed to create booking:", err);

    toast.error(
      err instanceof Error
        ? err.message
        : "Failed to send booking request."
    );
  } finally {
    setIsSubmitting(false);
  }
};

  if (isLoading) {
    return <DetailSkeleton />
  }

  if (error || !service) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed px-4 py-14 text-center">
          <PackageOpen className="h-12 w-12 text-muted-foreground" />

          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Service not found</h1>
            <p className="text-sm text-muted-foreground">
              {error ||
                "This service doesn't exist or is no longer available."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button variant="outline" onClick={handleRetry}>
              Try again
            </Button>

            <Link
              href="/services"
              className={buttonVariants({ variant: "outline" })}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Services
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const infoCards = [
    { label: "Duration", value: service.estimatedDuration },
    { label: "Mode", value: service.serviceMode },
    { label: "Area", value: service.serviceArea },
  ]

  const subtitle = service.technicianEmail || service.serviceArea || ""

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Back */}
      <Link
        href="/services"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Services
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        {/* Left — service info */}
        <div className="space-y-5">
          {/* Banner */}
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border bg-orange-100">
            {service.image ? (
              <Image
                src={service.image}
                alt={service.title}
                fill
                sizes="(min-width: 1024px) calc(100vw - 440px), 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-medium text-orange-700">
                {service.category}
              </div>
            )}
          </div>

          {/* Category badge */}
          <div>
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
              {service.category}
            </span>
          </div>

          {/* Title + description */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {service.title}
            </h1>

            {service.description && (
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                {service.description}
              </p>
            )}
          </div>

          {/* Duration / Mode / Area */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {infoCards.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border bg-card p-4 text-center shadow-sm"
              >
                <p className="text-lg font-bold">{item.value || "—"}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          {/* Technician */}
          <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
              {getInitials(service.technicianName)}
            </div>

            <div className="min-w-0">
              <p className="font-semibold">
                {service.technicianName || "Technician"}
              </p>

              {subtitle && (
                <p className="truncate text-sm text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right — request card */}
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <p className="text-2xl font-bold tracking-tight">
              From ${service.basePrice}
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Phone */}
              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone
                </label>

                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="01711-000000"
                  value={form.phone}
                  onChange={handleChange}
                  className="h-9"
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label htmlFor="address" className="text-sm font-medium">
                  Address
                </label>

                <Input
                  id="address"
                  name="address"
                  placeholder="House, road, area"
                  value={form.address}
                  onChange={handleChange}
                  className="h-9"
                />
              </div>

              {/* Preferred Date */}
              <div className="space-y-1.5">
                <label htmlFor="date" className="text-sm font-medium">
                  Preferred Date
                </label>

                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  className="h-9"
                />
              </div>

              {/* Problem Description */}
              <div className="space-y-1.5">
                <label
                  htmlFor="description"
                  className="text-sm font-medium"
                >
                  Problem Description
                </label>

                <Textarea
                  id="description"
                  name="description"
                  placeholder="Min 20 characters"
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              {/* Submit */}
              <Button
  type="submit"
  disabled={isSubmitting || sessionLoading}
  className="h-10 w-full bg-orange-600 text-white hover:bg-orange-700"
>
  {isSubmitting
    ? "Sending..."
    : sessionLoading
      ? "Loading session..."
      : "Request Repair"}
</Button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  )
}
