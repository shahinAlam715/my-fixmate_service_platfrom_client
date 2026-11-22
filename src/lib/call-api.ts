// callApi — fetch this app's own /api/* routes from any context.
//
// Browser: relative URL, cookies are sent automatically.
// Server (server action / server component): relative URLs don't
// resolve, so build an absolute URL from the incoming request and
// forward its cookies — route handlers (requireApiAuth in
// src/lib/api.ts) need them to resolve the session.
//
// next/headers is imported lazily on purpose: this module is shared
// with client components, and a static import would pull next/headers
// (and, via core.ts, auth.ts + mongodb) into the browser bundle.

export const callApi = async (path: string, init?: RequestInit) => {
  if (typeof window !== "undefined") {
    return fetch(path, init)
  }

  const { headers } = await import("next/headers")
  const requestHeaders = await headers()

  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http"

  const merged = new Headers(init?.headers)
  merged.set("cookie", requestHeaders.get("cookie") ?? "")

  return fetch(`${protocol}://${host}${path}`, {
    ...init,
    headers: merged,
  })
}
