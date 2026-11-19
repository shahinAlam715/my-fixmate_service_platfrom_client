"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

interface IService {
  _id: string
  title: string
  category: string
  basePrice: number
  image: string
  approvalStatus: "pending" | "approved" | "rejected"
  isAvailable: boolean
}

export default function MyServicesTable({
  services,
}: {
  services: IService[]
}) {
  const [serviceData, setServiceData] = useState(services)

  const handleAvailability = (id: string, checked: boolean) => {
    setServiceData((prev) =>
      prev.map((service) =>
        service._id === id
          ? { ...service, isAvailable: checked }
          : service
      )
    )
  }

  const handleDelete = (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this service?"
    )

    if (!confirmDelete) return

    setServiceData((prev) =>
      prev.filter((service) => service._id !== id)
    )
  }

  const getStatusStyle = (status: IService["approvalStatus"]) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700"

      case "pending":
        return "bg-yellow-100 text-yellow-700"

      case "rejected":
        return "bg-red-100 text-red-700"

      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-background">
      <table className="w-full min-w-[750px] text-sm">
        <thead className="bg-muted/50">
          <tr className="border-b text-left text-xs uppercase text-muted-foreground">
            <th className="px-4 py-3">Service</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Approval</th>
            <th className="px-4 py-3">Available</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {serviceData.map((service) => (
            <tr
              key={service._id}
              className="border-b transition-colors hover:bg-muted/30"
            >
              {/* Service */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-orange-100">
                    {service.image ? (
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-orange-200" />
                    )}
                  </div>

                  <span className="font-medium whitespace-nowrap">
                    {service.title}
                  </span>
                </div>
              </td>

              {/* Category */}
              <td className="px-4 py-3 text-muted-foreground">
                {service.category}
              </td>

              {/* Price */}
              <td className="px-4 py-3">
                ${service.basePrice}
              </td>

              {/* Approval */}
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusStyle(
                    service.approvalStatus
                  )}`}
                >
                  {service.approvalStatus}
                </span>
              </td>

              {/* Availability */}
              <td className="px-4 py-3">
                <Switch
                  checked={service.isAvailable}
                  onCheckedChange={(checked) =>
                    handleAvailability(service._id, checked)
                  }
                  disabled={service.approvalStatus !== "approved"}
                />
              </td>

              {/* Actions */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                   
                  >
                    <Link
                      href={`/dashboard/technician/my-services/edit/${service._id}`}
                    >
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(service._id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {serviceData.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            You have not added any services yet.
          </p>
        </div>
      )}
    </div>
  )
}