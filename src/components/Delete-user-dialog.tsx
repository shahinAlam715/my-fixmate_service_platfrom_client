"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteUserDialogProps {
  userId: string;
  userName: string;
  userEmail: string;
  currentUserEmail?: string;
  onDeleted: (userId: string) => void;
  disabled?: boolean;
}

export default function DeleteUserDialog({
  userId,
  userName,
  userEmail,
  currentUserEmail,
  onDeleted,
  disabled = false,
}: DeleteUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (userEmail === currentUserEmail) {
      toast.error("You cannot delete your own account.");
      return;
    }

    setIsDeleting(true);

    try {
      // jwt-secured /api layer (admin session enforced by the route)
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete user.");
      }

      onDeleted(userId);
      toast.success("User deleted successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Delete user error:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to delete user.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${userName}`}
          />
        }
      >
        <Trash2 className="h-4 w-4" />
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete{" "}
            <span className="font-semibold text-foreground">{userName}</span>{" "}
            and remove their account from the database.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
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
                Delete User
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
