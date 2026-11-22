// import { NextResponse } from "next/server"
// import { requireApiAuth, proxyBackend } from "@/lib/api"

// // GET /api/services — approved services listing (session required;
// // the backend's Verifytoken rejects anonymous requests anyway).
// // Query string (category, search, serviceMode, sort, limit) passes through.
// export async function GET(req: Request) {
//   const auth = await requireApiAuth()
//   if (!auth.ok) {
//     return NextResponse.json({ message: auth.message }, { status: auth.status })
//   }

//   const { search } = new URL(req.url)

//   return proxyBackend(`/services${search}`, auth.token)
// }

// // POST /api/services — technician adds a service
// export async function POST(req: Request) {
//   const auth = await requireApiAuth("technician")
//   if (!auth.ok) {
//     return NextResponse.json({ message: auth.message }, { status: auth.status })
//   }

//   const body = await req.json().catch(() => null)
//   if (!body || typeof body !== "object" || Array.isArray(body)) {
//     return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 })
//   }

//   return proxyBackend("/services", auth.token, { method: "POST", body })
// }



import { proxyBackend } from "@/lib/api";

// ========================================
// GET ALL SERVICES — PUBLIC
// GET /api/services
// ========================================

export async function GET(req: Request) {
  try {
    const { search } = new URL(req.url);

    // Preserve query parameters (category, search, limit, sort...)
    const queryString = search;

    return proxyBackend(`/services${queryString}`);
  } catch (error) {
    console.error("Get all services error:", error);

    return Response.json(
      { message: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
