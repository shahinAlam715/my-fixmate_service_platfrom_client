"use client"

import { useState } from "react"
import { Camera, Loader2, UserRound } from "lucide-react"
import Image from "next/image"
import toast from "react-hot-toast"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ProfileFormData {
  name: string
  email: string
  phone: string
  area: string
  bio: string
}

export default function UpdateProfilePage() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-[300px] items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">
          Please sign in to update your profile.
        </p>
      </div>
    )
  }

  return <ProfileForm user={session.user} />
}

function ProfileForm({
  user,
}: {
  user: typeof authClient.$Infer.Session.user
}) {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    area: user.area || "",
    bio: user.bio || "",
  })

  const [imagePreview, setImagePreview] = useState<string | null>(
    user.image || null
  )

  // Stores the final image URL from ImgBB
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>(
    user.image || ""
  )

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isImageUploading, setIsImageUploading] = useState(false)
  const [imageUploadError, setImageUploadError] = useState(false)

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle image upload
  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) return

    // Validate image type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.")
      e.target.value = ""
      return
    }

    // Validate image size (2 MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2 MB.")
      e.target.value = ""
      return
    }

    setImageFile(file)
    setImageUploadError(false)
    setIsImageUploading(true)

    // Show local image preview
    const reader = new FileReader()

    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }

    reader.onerror = () => {
      toast.error("Failed to read the selected image.")
    }

    reader.readAsDataURL(file)

    // Upload image to ImgBB
    try {
      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY

      if (!apiKey) {
        throw new Error("ImgBB API key is missing!")
      }

      const formData = new FormData()
      formData.append("image", file)

      const imgbbUrl = `https://api.imgbb.com/1/upload?key=${apiKey}`

      const res = await fetch(imgbbUrl, {
        method: "POST",
        body: formData,
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(
          result.error?.message || "Image upload failed."
        )
      }

      // Store uploaded image URL
      setUploadedImageUrl(result.data.url)

      toast.success("Image uploaded successfully!")
    } catch (error) {
      console.error("ImgBB upload error:", error)

      setImageUploadError(true)
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload image."
      )
    } finally {
      setIsImageUploading(false)
    }
  }

  // Update profile using Better Auth
  const handleUpdateProfile = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Name is required.")
      return
    }

    // Prevent profile update if image upload failed
    if (imageUploadError) {
      toast.error("Please upload your image successfully first.")
      return
    }

    if (isImageUploading) {
      toast.error("Please wait for image upload to finish.")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          image: uploadedImageUrl || "",
          phone: formData.phone.trim(),
          area: formData.area.trim(),
          bio: formData.bio.trim(),
        }),
      })

      const result = await res.json().catch(() => null)

      if (!res.ok) {
        toast.error(result?.message || "Failed to update your profile.")
        return
      }

      toast.success("Your profile updated successfully! 🎉")

      setImageFile(null)
    } catch (error) {
      console.error("Profile update error:", error)

      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Reset form to original session data
  const handleReset = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      area: user.area || "",
      bio: user.bio || "",
    })

    setImagePreview(user.image || null)
    setUploadedImageUrl(user.image || "")
    setImageFile(null)
    setImageUploadError(false)
    setIsImageUploading(false)

    toast.success("Profile form reset successfully.")
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-3 py-6 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Update Profile
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage your personal information and profile details.
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6 md:p-8">
        <form
          onSubmit={handleUpdateProfile}
          className="space-y-6"
        >
          {/* Profile Image */}
          <div className="flex flex-col items-center gap-4 border-b pb-6 sm:flex-row sm:items-center">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Profile preview"
                  width={200}
                  height={200}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound className="h-10 w-10 text-muted-foreground" />
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <h3 className="font-semibold">Profile Picture</h3>

              <p className="text-sm text-muted-foreground">
                Upload JPG, PNG or WEBP. Maximum 2 MB.
              </p>

              <div>
                <Input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isImageUploading || isLoading}
                  onChange={handleImageChange}
                />

                <Label
                  htmlFor="profileImage"
                  className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {isImageUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Upload Image
                    </>
                  )}
                </Label>
              </div>

              {imageUploadError && (
                <p className="text-sm text-destructive">
                  Image upload failed. Please try again.
                </p>
              )}
            </div>
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>

              <Input
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>

              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                readOnly
                className="bg-muted"
              />

              <p className="text-xs text-muted-foreground">
                Email address cannot be changed here.
              </p>
            </div>
          </div>

          {/* Phone & Area */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>

              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+880 1XXXXXXXXX"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Area / Location</Label>

              <Input
                id="area"
                name="area"
                placeholder="Enter your area"
                value={formData.area}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>

            <Textarea
              id="bio"
              name="bio"
              placeholder="Write a short bio about yourself..."
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              maxLength={500}
              className="resize-none"
            />

            <p className="text-xs text-muted-foreground">
              {formData.bio.length}/500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              disabled={isLoading || isImageUploading}
              onClick={handleReset}
            >
              Reset
            </Button>

            <Button
              type="submit"
              disabled={isLoading || isImageUploading}
              className="w-full sm:w-auto"
            >
              {isLoading || isImageUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isImageUploading ? "Uploading Image..." : "Updating..."}
                </>
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}