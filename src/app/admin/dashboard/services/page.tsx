"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CircleAlert,
  Loader2,
  PackageOpen,
  RotateCcw,
} from "lucide-react"
import toast from "react-hot-toast"

import {
  GetAllServices,
  GetPendingServices,
  UpdateServiceApproval,
} from "@/all-api/serviceapi"
import { Button } from "@/components/ui/button"

type ApprovalStatus = "pending" | "approved" | "rejected"
type StatusTab = ApprovalStatus | "all"

interface IService {
  _id: string
  title: string
  category: string
  basePrice: number
  technicianName?: string
  approvalStatus: ApprovalStatus
}

const tabs: { value: StatusTab; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
]

const statusStyles: Record<ApprovalStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
}

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState<StatusTab>("pending")
  const [services, setServices] = useState<IService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  // Which row is currently being approved/rejected
  const [action, setAction] = useState<{
    id: string
    status: ApprovalStatus
  } | null>(null)

  const requestIdRef = useRef(0)

  // Pending tab uses the pending endpoint; the other tabs need every status,
  // so they load the full list and filter client-side.
  useEffect(() => {
    const requestId = ++requestIdRef.current

    const fetchServices =
      activeTab === "pending" ? GetPendingServices : GetAllServices

    fetchServices()
      .then((data: unknown) => {
        if (requestId !== requestIdRef.current) return

        setServices(Array.isArray(data) ? (data as IService[]) : [])
        setError(null)
        setIsLoading(false)
      })
      .catch((err: unknown) => {
        if (requestId !== requestIdRef.current) return

        console.error("Failed to fetch services:", err)
        setServices([])
        setError(
          err instanceof Error ? err.message : "Failed to fetch services."
        )
        setIsLoading(false)
      })
  }, [activeTab, reloadKey])

  const handleTabChange = (tab: StatusTab) => {
    setActiveTab(tab)
    setIsLoading(true)
  }

  const handleRetry = () => {
    setIsLoading(true)
    setReloadKey((key) => key + 1)
  }

  const handleApproval = async (
    id: string,
    approvalStatus: Extract<ApprovalStatus, "approved" | "rejected">
  ) => {
    setAction({ id, status: approvalStatus })

    try {
      await UpdateServiceApproval(id, approvalStatus)

      setServices((prev) =>
        prev.map((service) =>
          service._id === id
            ? { ...service, approvalStatus }
            : service
        )
      )

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
      setAction(null)
    }
  }

  const filteredServices =
    activeTab === "all"
      ? services
      : services.filter(
          (service) => service.approvalStatus === activeTab
        )

  return (
    <div className="min-h-screen bg-muted/30 px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Services
          </h1>

          {/* Back to Home */}
          <Button variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Status tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? "default" : "outline"}
              onClick={() => handleTabChange(tab.value)}
              className={
                activeTab === tab.value
                  ? "bg-orange-600 px-4 text-white hover:bg-orange-700"
                  : "px-4"
              }
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Services card */}
        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
          {isLoading ? (
            /* Loading */
            <div className="flex min-h-60 items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading services...
              </p>
            </div>
          ) : error ? (
            /* Error */
            <div className="flex min-h-60 flex-col items-center justify-center gap-3 px-4 text-center">
              <CircleAlert className="h-10 w-10 text-destructive" />

              <div className="space-y-1">
                <p className="font-semibold">Something went wrong</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>

              <Button variant="outline" onClick={handleRetry}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            </div>
          ) : filteredServices.length === 0 ? (
            /* Empty state */
            <div className="flex min-h-60 flex-col items-center justify-center gap-3 px-4 text-center">
              <PackageOpen className="h-10 w-10 text-muted-foreground" />

              <div className="space-y-1">
                <p className="font-semibold">
                  {activeTab === "all"
                    ? "No services found"
                    : `No ${activeTab} services found`}
                </p>

                <p className="text-sm text-muted-foreground">
                  This tab is empty right now. Try another tab or check
                  back later.
                </p>
              </div>
            </div>
          ) : (
            /* Table */
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Technician</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredServices.map((service) => {
                  const isRowBusy = action?.id === service._id

                  return (
                    <tr
                      key={service._id}
                      className="border-b transition-colors hover:bg-muted/30"
                    >
                      {/* Service */}
                      <td className="px-4 py-3 font-medium">
                        {service.title}
                      </td>

                      {/* Technician */}
                      <td className="px-4 py-3 text-muted-foreground">
                        {service.technicianName || "—"}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-muted-foreground">
                        {service.category}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        ${service.basePrice}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[service.approvalStatus]}`}
                        >
                          {service.approvalStatus}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {service.approvalStatus !== "approved" && (
                            <Button
                              size="sm"
                              disabled={isRowBusy}
                              onClick={() =>
                                handleApproval(service._id, "approved")
                              }
                              className="bg-orange-600 text-white hover:bg-orange-700"
                            >
                              {isRowBusy &&
                              action?.status === "approved" ? (
                                <>
                                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                  Approving...
                                </>
                              ) : (
                                "Approve"
                              )}
                            </Button>
                          )}

                          {service.approvalStatus !== "rejected" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isRowBusy}
                              onClick={() =>
                                handleApproval(service._id, "rejected")
                              }
                            >
                              {isRowBusy &&
                              action?.status === "rejected" ? (
                                <>
                                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                  Rejecting...
                                </>
                              ) : (
                                "Reject"
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
