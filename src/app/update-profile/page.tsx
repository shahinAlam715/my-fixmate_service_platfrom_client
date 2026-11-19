
"use client"

import { useState } from "react"
import { Camera, Loader2, UserRound } from "lucide-react"
import Image from "next/image"

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
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Please sign in to update your profile.
        </p>
      </div>
    )
  }

  return <ProfileForm user={session.user} />
}

function ProfileForm({ user }: { user: typeof authClient.$Infer.Session.user }) {
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

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.")
      return
    }

    setImageFile(file)

    const reader = new FileReader()

    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }

    reader.readAsDataURL(file)
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    setIsLoading(true)

    try {
      console.log("Profile Data:", formData)
      console.log("Image File:", imageFile)

      // Connect your profile update API here
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-3 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Update Profile
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage your personal information and profile details.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

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
                Upload a profile image. JPG, PNG or WEBP.
              </p>

              <div>
                <Label
                  htmlFor="profileImage"
                  className="inline-flex cursor-pointer"
                >
                  <Button type="button" variant="outline" size="sm">
                    <span>
                      <Camera className="mr-2 h-4 w-4" />
                      Upload Image
                    </span>
                  </Button>
                </Label>

                <Input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
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
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
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
              className="resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setFormData({
                  name: user.name || "",
                  email: user.email || "",
                  phone: user.phone || "",
                  area: user.area || "",
                  bio: user.bio || "",
                })

                setImagePreview(user.image || null)
                setImageFile(null)
              }}
            >
              Reset
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
