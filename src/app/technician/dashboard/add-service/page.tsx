
"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ImagePlus, Loader2, Upload } from "lucide-react"
import toast from "react-hot-toast"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { postserviceData } from "@/all-api/serviceapi"

type ServiceCategory =
  | "Smartphone"
  | "Laptop & PC"
  | "AC"
  | "Refrigerator"
  | "TV"
  | "Washing Machine"
  | "Electrical"

type ServiceMode = "Home Visit" | "Shop Drop-off"

interface IServiceForm {
  title: string
  category: ServiceCategory
  basePrice: string
  estimatedDuration: string
  serviceMode: ServiceMode
  serviceArea: string
  description: string
  image: string
}

const categories: ServiceCategory[] = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
]

const serviceModes: ServiceMode[] = [
  "Home Visit",
  "Shop Drop-off",
]

export default function AddServicePage() {


  const { data: session } = authClient.useSession()

  const [formData, setFormData] = useState<IServiceForm>({
    title: "",
    category: "Smartphone",
    basePrice: "",
    estimatedDuration: "",
    serviceMode: "Home Visit",
    serviceArea: "",
    description: "",
    image: "",
  })

  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const technicianName = session?.user?.name || ""
  const technicianEmail = session?.user?.email || ""

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Upload service image to ImgBB
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.")
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY

    if (!apiKey) {
      toast.error("ImgBB API key is missing.")
      return
    }

    setIsUploading(true)

    try {
      const imageFormData = new FormData()
      imageFormData.append("image", file)

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        {
          method: "POST",
          body: imageFormData,
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error("Image upload failed.")
      }

      setFormData((prev) => ({
        ...prev,
        image: result.data.url,
      }))

      toast.success("Image uploaded successfully!")
    } catch (error) {
      console.error("Image upload error:", error)
      toast.error("Failed to upload image.")
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  // Submit service form
 const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault()

  if (!technicianEmail) {
    toast.error("Please sign in first.")
    return
  }

  if (!formData.image) {
    toast.error("Please upload a service image.")
    return
  }

  setIsSubmitting(true)

  try {
    const serviceData = {
      ...formData,
      basePrice: Number(formData.basePrice),
      technicianName,
      technicianEmail,
      approvalStatus: "pending",
      isAvailable: true,
      createdAt: new Date(),
    }

    const Adddata = await postserviceData(serviceData)

    console.log("Added Service:", Adddata)

    toast.success("Service submitted for approval!")

    // Reset form after successful submission
    setFormData({
      title: "",
      category: "Smartphone",
      basePrice: "",
      estimatedDuration: "",
      serviceMode: "Home Visit",
      serviceArea: "",
      description: "",
      image: "",
    })
  } catch (error) {
    console.error("Submit error:", error)

    toast.error(
      error instanceof Error
        ? error.message
        : "Failed to submit service."
    )
  } finally {
    setIsSubmitting(false)
  }
}

  return (
    <div className="min-h-screen bg-muted/30 px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Add Service
          </h1>

          <Button variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Form Card */}
        <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title and Category */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="title"
                  className="text-sm font-medium"
                >
                  Title
                </label>

                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. iPhone Screen Replacement"
                  required
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="category"
                  className="text-sm font-medium"
                >
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Base Price and Duration */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="basePrice"
                  className="text-sm font-medium"
                >
                  Base Price (USD)
                </label>

                <input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  min="1"
                  value={formData.basePrice}
                  onChange={handleChange}
                  placeholder="45"
                  required
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="estimatedDuration"
                  className="text-sm font-medium"
                >
                  Estimated Duration
                </label>

                <input
                  id="estimatedDuration"
                  name="estimatedDuration"
                  value={formData.estimatedDuration}
                  onChange={handleChange}
                  placeholder="2-3 hours"
                  required
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Service Mode and Area */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="serviceMode"
                  className="text-sm font-medium"
                >
                  Service Mode
                </label>

                <select
                  id="serviceMode"
                  name="serviceMode"
                  value={formData.serviceMode}
                  onChange={handleChange}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {serviceModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="serviceArea"
                  className="text-sm font-medium"
                >
                  Service Area
                </label>

                <input
                  id="serviceArea"
                  name="serviceArea"
                  value={formData.serviceArea}
                  onChange={handleChange}
                  placeholder="Dhanmondi, Dhaka"
                  required
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Technician and Email */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="technicianName"
                  className="text-sm font-medium"
                >
                  Technician (read-only)
                </label>

                <input
                  id="technicianName"
                  value={technicianName}
                  readOnly
                  className="h-10 w-full rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="technicianEmail"
                  className="text-sm font-medium"
                >
                  Email (read-only)
                </label>

                <input
                  id="technicianEmail"
                  value={technicianEmail}
                  readOnly
                  className="h-10 w-full rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What does the service include?"
                required
                rows={4}
                className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Service Image */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Service Image
              </label>

              <label
                htmlFor="serviceImage"
                className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-primary/30 bg-muted/20 px-4 py-6 text-center transition hover:bg-muted/50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Uploading image...
                    </span>
                  </>
                ) : formData.image ? (
                  <>
                    <ImagePlus className="h-6 w-6 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-600">
                      Image uploaded successfully
                    </span>
                    <span className="break-all text-xs text-muted-foreground">
                      {formData.image}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Click to replace image
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Upload image (ImgBB)
                    </span>
                    <span className="text-xs text-muted-foreground">
                      JPG, PNG or WEBP (Max 5MB)
                    </span>
                  </>
                )}
              </label>

              <input
                id="serviceImage"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
              />
            </div>

            {/* Image Preview */}
            {formData.image && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Image Preview
                </p>

                <div className="overflow-hidden rounded-lg border">
                  <Image
                    src={formData.image}
                    alt="Service preview"
                    height={100}
                    width={100}
                    className="h-48 w-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-start">
              <Button
                type="submit"
                disabled={isUploading || isSubmitting}
                className="bg-orange-600 text-white hover:bg-orange-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit for Approval"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
