"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Loader2, PackageOpen } from "lucide-react"
import toast from "react-hot-toast"

import { GetAllServices, UpdateServiceApproval } from "@/all-api/serviceapi"
import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

type ApprovalStatus = "pending" | "approved" | "rejected"

interface IService {
  _id: string
  title: string
  category: string
  basePrice: number
  image: string
  approvalStatus: ApprovalStatus
  description?: string
  estimatedDuration?: string
  serviceMode?: string
  serviceArea?: string
  technicianName?: string
  technicianEmail?: string
}

const statusStyles: Record<ApprovalStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
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
      <Skeleton className="mb-6 h-4 w-40" />

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

        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  )
}

export default function AdminServiceDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [service, setService] = useState<IService | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [actioning, setActioning] = useState<ApprovalStatus | null>(null)

  const requestIdRef = useRef(0)

  // The public GET /services/:id only returns approved + available ones,
  // so admin loads the full list and picks the service out of it — this
  // works for pending/rejected services too.
  useEffect(() => {
    const requestId = ++requestIdRef.current

    GetAllServices()
      .then((data: unknown) => {
        if (requestId !== requestIdRef.current) return

        const found = Array.isArray(data)
          ? (data as IService[]).find((item) => item._id === id)
          : undefined

        if (found) {
          setService(found)
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

  const handleApproval = async (
    approvalStatus: Extract<ApprovalStatus, "approved" | "rejected">
  ) => {
    if (!service) return

    setActioning(approvalStatus)

    try {
      await UpdateServiceApproval(service._id, approvalStatus)

      setService({ ...service, approvalStatus })

      toast.success(
        approvalStatus === "approved"
          ? "Service approved!"
          : "Service rejected!"
      )
    } catch (err) {
      console.error("Approval error:", err)

      toast.error(
        err instanceof Error ? err.message : "Failed to update approval."
      )
    } finally {
      setActioning(null)
    }
  }

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
              href="/admin/dashboard/services"
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
        href="/admin/dashboard/services"
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

        {/* Right — review card (admin) */}
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="text-2xl font-bold tracking-tight">
                From ${service.basePrice}
              </p>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[service.approvalStatus]}`}
              >
                {service.approvalStatus}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Review this service and approve or reject it for the
                marketplace.
              </p>

              <div className="flex gap-2">
                {service.approvalStatus !== "approved" && (
                  <Button
                    onClick={() => handleApproval("approved")}
                    disabled={actioning !== null}
                    className="flex-1 bg-orange-600 text-white hover:bg-orange-700"
                  >
                    {actioning === "approved" ? (
                      <>
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      "Approve"
                    )}
                  </Button>
                )}

                {service.approvalStatus !== "rejected" && (
                  <Button
                    variant="outline"
                    onClick={() => handleApproval("rejected")}
                    disabled={actioning !== null}
                    className="flex-1"
                  >
                    {actioning === "rejected" ? (
                      <>
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      "Reject"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
