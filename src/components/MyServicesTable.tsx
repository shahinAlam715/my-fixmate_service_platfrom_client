"use client"

import Image from "next/image"
import { useState } from "react"
import { Loader2, Pencil, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DeleteService, UpdateService } from "@/all-api/serviceapi"

interface IService {
  _id: string
  title: string
  category: string
  basePrice: number
  image: string
  approvalStatus: "pending" | "approved" | "rejected"
  isAvailable: boolean
}

interface IEditForm {
  title: string
  category: string
  basePrice: string
}

type ServiceCategory =
  | "Smartphone"
  | "Laptop & PC"
  | "AC"
  | "Refrigerator"
  | "TV"
  | "Washing Machine"
  | "Electrical"

const categories: ServiceCategory[] = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
]

export default function MyServicesTable({
  services,
}: {
  services: IService[]
}) {
  const [serviceData, setServiceData] = useState(services)

  const [deleteTarget, setDeleteTarget] = useState<IService | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [editTarget, setEditTarget] = useState<IService | null>(null)
  const [editForm, setEditForm] = useState<IEditForm>({
    title: "",
    category: categories[0],
    basePrice: "",
  })
  const [isUpdating, setIsUpdating] = useState(false)

  const handleAvailability = (id: string, checked: boolean) => {
    setServiceData((prev) =>
      prev.map((service) =>
        service._id === id
          ? { ...service, isAvailable: checked }
          : service
      )
    )
  }

  // ===============================
  // DELETE (serviceapi.ts)
  // ===============================

  const handleDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)

    try {
      await DeleteService(deleteTarget._id)

      setServiceData((prev) =>
        prev.filter((service) => service._id !== deleteTarget._id)
      )

      toast.success("Service deleted successfully!")
      setDeleteTarget(null)
    } catch (error) {
      console.error("Delete service error:", error)

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete service."
      )
    } finally {
      setIsDeleting(false)
    }
  }

  // ===============================
  // EDIT / UPDATE (serviceapi.ts)
  // ===============================

  const openEdit = (service: IService) => {
    setEditTarget(service)
    setEditForm({
      title: service.title,
      category: service.category,
      basePrice: String(service.basePrice),
    })
  }

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!editTarget) return

    if (!editForm.title.trim()) {
      toast.error("Please enter a service title.")
      return
    }

    const price = Number(editForm.basePrice)

    if (!price || price < 1) {
      toast.error("Please enter a valid price.")
      return
    }

    setIsUpdating(true)

    try {
      const payload = {
        title: editForm.title.trim(),
        category: editForm.category,
        basePrice: price,
      }

      await UpdateService(editTarget._id, payload)

      setServiceData((prev) =>
        prev.map((service) =>
          service._id === editTarget._id
            ? { ...service, ...payload }
            : service
        )
      )

      toast.success("Service updated successfully!")
      setEditTarget(null)
    } catch (error) {
      console.error("Update service error:", error)

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update service."
      )
    } finally {
      setIsUpdating(false)
    }
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
    <>
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
                      onClick={() => openEdit(service)}
                    >
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteTarget(service)}
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

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.title}
              </span>{" "}
              from your services. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Service
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit service dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open && !isUpdating) setEditTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleUpdate} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
            </DialogHeader>

            {/* Title */}
            <div className="space-y-2">
              <label
                htmlFor="edit-title"
                className="text-sm font-medium"
              >
                Title
              </label>

              <input
                id="edit-title"
                name="title"
                value={editForm.title}
                onChange={handleEditChange}
                placeholder="e.g. iPhone Screen Replacement"
                required
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label
                htmlFor="edit-category"
                className="text-sm font-medium"
              >
                Category
              </label>

              <select
                id="edit-category"
                name="category"
                value={editForm.category}
                onChange={handleEditChange}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Base Price */}
            <div className="space-y-2">
              <label
                htmlFor="edit-basePrice"
                className="text-sm font-medium"
              >
                Base Price (USD)
              </label>

              <input
                id="edit-basePrice"
                name="basePrice"
                type="number"
                min="1"
                value={editForm.basePrice}
                onChange={handleEditChange}
                placeholder="45"
                required
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Actions */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTarget(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-orange-600 text-white hover:bg-orange-700"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
