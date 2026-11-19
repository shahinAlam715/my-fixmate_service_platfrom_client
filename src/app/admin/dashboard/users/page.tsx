
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Loader2,
  Users,
} from "lucide-react"
import toast from "react-hot-toast"
import Image from "next/image"

import { usersData } from "@/all-api/userapi"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import DeleteUserDialog from "@/components/Delete-user-dialog"


type UserRole = "customer" | "technician" | "admin"

interface IUser {
  _id: string
  name: string
  email: string
  image?: string
  role?: UserRole
  phone?: string
  area?: string
  bio?: string
}

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL

const roleStyles: Record<UserRole, string> = {
  customer: "bg-blue-100 text-blue-700",
  technician: "bg-amber-100 text-amber-700",
  admin: "bg-emerald-100 text-emerald-700",
}

export default function UsersPage() {
  const { data: session } = authClient.useSession()

  const [users, setUsers] = useState<IUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Fetch users from API
  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await usersData()

        console.log("Users API response:", data)

        if (Array.isArray(data)) {
          setUsers(data)
        } else {
          console.error("API did not return an array:", data)
          setUsers([])
        }
      } catch (error) {
        console.error("Failed to fetch users:", error)
        toast.error("Failed to load users.")
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [])

  // Update user role
  const handleRoleChange = async (
    userId: string,
    newRole: UserRole
  ) => {
    if (!API_URL) {
      toast.error("Server API URL is missing.")
      return
    }

    setUpdatingId(userId)

    try {
      const response = await fetch(`${API_URL}/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to update role.")
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId
            ? { ...user, role: newRole }
            : user
        )
      )

      toast.success("Role updated successfully!")
    } catch (error) {
      console.error("Role update error:", error)

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update role."
      )
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Users
              </h1>

              {!isLoading && (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {users.length} users
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              Manage users, permissions and account roles.
            </p>
          </div>

          {/* Back to Home */}
          <Button variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Users Card */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">

          {/* Table Header */}
          <div className="hidden border-b bg-muted/40 px-5 py-4 lg:grid lg:grid-cols-[1.5fr_1.5fr_1.3fr_auto] lg:items-center lg:gap-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              User
            </p>

            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email
            </p>

            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Role
            </p>

            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Action
            </p>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex min-h-60 items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading users...
              </p>
            </div>
          ) : users.length === 0 ? (
            /* Empty State */
            <div className="flex min-h-60 flex-col items-center justify-center gap-3 px-4 text-center">
              <Users className="h-10 w-10 text-muted-foreground" />

              <h3 className="font-semibold">No users found</h3>

              <p className="text-sm text-muted-foreground">
                There are currently no users to display.
              </p>
            </div>
          ) : (
            /* User List */
            <div className="divide-y">
              {users.map((user) => {
                const role = user.role || "customer"

                const isSelf =
                  user.email === session?.user?.email

                return (
                  <div
                    key={user._id}
                    className="flex flex-col gap-4 px-4 py-4 transition-colors hover:bg-muted/30 sm:px-5 lg:grid lg:grid-cols-[1.5fr_1.5fr_1.3fr_1fr_auto] lg:items-center lg:gap-4"
                  >
                    {/* User */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name || "User"}
                            height={100}
                            width={100}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          user.name
                            ?.split(" ")
                            .map((word) => word[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase() || "U"
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {user.name}
                        </p>

                        <p className="truncate text-xs text-muted-foreground lg:hidden">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <p className="hidden truncate text-sm text-muted-foreground lg:block">
                      {user.email}
                    </p>

                    {/* Role */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${roleStyles[role]}`}
                      >
                        {role}
                      </span>

                      {isSelf && (
                        <span className="text-xs text-muted-foreground">
                          (You)
                        </span>
                      )}

                      {!isSelf && (
                        <select
                          value={role}
                          disabled={updatingId === user._id}
                          onChange={(e) =>
                            handleRoleChange(
                              user._id,
                              e.target.value as UserRole
                            )
                          }
                          className="h-8 max-w-32 rounded-md border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Change role for ${user.name}`}
                        >
                          <option value="customer">Customer</option>
                          <option value="technician">Technician</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}

                      {updatingId === user._id && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>

                    {/* Joined */}

                    {/* Delete */}
                    <div className="flex items-center justify-end">
                      {isSelf ? (
                        <span className="text-xs text-muted-foreground">
                          Your account
                        </span>
                      ) : (
                        <DeleteUserDialog
                          userId={user._id}
                          userName={user.name}
                          userEmail={user.email}
                          currentUserEmail={session?.user?.email}
                          disabled={updatingId === user._id}
                          onDeleted={(userId) =>
                            setUsers((prevUsers) =>
                              prevUsers.filter(
                                (item) => item._id !== userId
                              )
                            )
                          }
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && users.length > 0 && (
          <p className="text-right text-xs text-muted-foreground">
            Showing {users.length} users
          </p>
        )}
      </div>
    </div>
  )
}
