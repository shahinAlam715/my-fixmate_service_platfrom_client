import { NextResponse } from "next/server";
import { getuserSession } from "./core";

// ========================================
// requireApiAuth — API session authentication
// Supports optional role verification
// ========================================

export type ApiAuth =
  | {
      ok: true;
      session: NonNullable<Awaited<ReturnType<typeof getuserSession>>>;
      token: string;
    }
  | {
      ok: false;
      status: 401 | 403;
      message: string;
    };

export const requireApiAuth = async (
  role?: string
): Promise<ApiAuth> => {
  const session = await getuserSession();

  const token = session?.session?.token;

  // Check login/session
  if (!session?.user || !token) {
    return {
      ok: false,
      status: 401,
      message: "Unauthorized",
    };
  }

  // Check user role
  if (role && session.user.role !== role) {
    return {
      ok: false,
      status: 403,
      message: "Forbidden",
    };
  }

  return {
    ok: true,
    session,
    token,
  };
};

// ========================================
// proxyBackend — proxy request to Express backend
// Supports both public and authenticated requests
// ========================================

export const proxyBackend = async (
  path: string,
  token?: string,
  options?: {
    method?: string;
    body?: unknown;
  }
): Promise<NextResponse> => {
  const base = process.env.NEXT_PUBLIC_SERVER_URL;

  if (!base) {
    return NextResponse.json(
      { message: "Server URL is missing." },
      { status: 500 }
    );
  }

  const hasBody = options?.body !== undefined;

  const headers: HeadersInit = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
  };

  try {
    const res = await fetch(`${base}${path}`, {
      method: options?.method ?? "GET",
      cache: "no-store",
      headers,
      body: hasBody ? JSON.stringify(options.body) : undefined,
    });

    const text = await res.text();

    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type":
          res.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error("Backend proxy error:", error);

    return NextResponse.json(
      { message: "Backend server is unavailable." },
      { status: 502 }
    );
  }
};