"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

type Role = "customer" | "technician";

const ROLES: { value: Role; label: string; hint: string }[] = [
  {
    value: "customer",
    label: "Customer",
    hint: "Book repairs",
  },
  {
    value: "technician",
    label: "Technician",
    hint: "Offer repair services",
  },
];

/** Official Google "G" logo (4-color). */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}

export default function SignUpPage() {
  const [role, setRole] = React.useState<Role>("customer");

  // Handle signup form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const userData = {
      name: String(formData.get("name")),
      email: String(formData.get("email")),
      password: String(formData.get("password")),
      role: role,
    };

    const { data, error } = await authClient.signUp.email({
      ...userData,
      callbackURL: "/",
    });

    if (!data) {
     toast.error("Sign Up fail!")
    }

   toast.success('Sign Up Successfull!')
  };

  return (
    <div className="flex items-center justify-center px-4 py-10 sm:py-14">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Create your account
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {/* Full Name */}
          <Input
            type="text"
            name="name"
            autoComplete="name"
            aria-label="Full Name"
            placeholder="Full Name"
            required
            className="h-10 px-3.5"
          />

          {/* Email */}
          <Input
            type="email"
            name="email"
            autoComplete="email"
            aria-label="Email"
            placeholder="Email"
            required
            className="h-10 px-3.5"
          />

          {/* Password */}
          <div>
            <Input
              type="password"
              name="password"
              autoComplete="new-password"
              aria-label="Password"
              placeholder="Password"
              minLength={6}
              pattern="(?=.*[a-z])(?=.*[A-Z]).{6,}"
              title="Password must contain at least 6 characters, one uppercase and one lowercase letter."
              required
              className="h-10 px-3.5"
            />

            <p className="mt-2 text-xs text-gray-500">
              Min 6 characters, one uppercase and one lowercase letter.
            </p>
          </div>

          {/* Role Selection */}
          <fieldset>
            <legend className="text-sm font-bold text-gray-900">I am a</legend>

            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ROLES.map((option) => {
                const selected = role === option.value;

                return (
                  <label
                    key={option.value}
                    className={
                      "cursor-pointer rounded-xl border-2 p-4 transition-colors " +
                      (selected
                        ? "border-orange-600 bg-orange-50/60"
                        : "border-gray-200 hover:border-gray-300")
                    }
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={selected}
                      onChange={() => setRole(option.value)}
                      className="sr-only"
                    />

                    <span className="block text-sm font-semibold text-gray-900">
                      {option.label}
                    </span>

                    <span className="mt-0.5 block text-xs text-gray-500">
                      {option.hint}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Sign Up Button */}
          <Button
            type="submit"
            className="mt-1 h-11 w-full bg-orange-600 text-base font-semibold text-white hover:bg-orange-700"
          >
            Sign Up
          </Button>
        </form>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Google Sign Up */}
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full gap-2.5 text-sm font-medium"
        >
          <GoogleIcon />
          Sign up with Google
        </Button>

        {/* Sign In Link */}
        <p className="mt-5 text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-gray-700 transition-colors hover:text-orange-600"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
