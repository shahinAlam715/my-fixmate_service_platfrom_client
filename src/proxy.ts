import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth";

export async function proxy(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // If user is not logged in
    if (!session?.user) {
      return NextResponse.redirect(
        new URL("/sign-in", request.url),
      );
    }

    // If user is logged in, continue
    return NextResponse.next();
  } catch (error) {
    console.error("Proxy authentication error:", error);

    return NextResponse.redirect(
      new URL("/sign-in", request.url),
    );
  }
}

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/customer/dashboard/:path*",
    "/technician/dashboard/:path*",
    "/update-profile",
  ],
};