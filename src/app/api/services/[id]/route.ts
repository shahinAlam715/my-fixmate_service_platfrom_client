import { NextResponse } from "next/server";
import { requireApiAuth, proxyBackend } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

// ========================================
// GET /api/services/:id — PUBLIC
// Anyone can view an approved service
// ========================================
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;

    return proxyBackend(`/services/${id}`);
  } catch (error) {
    console.error("Get single service error:", error);

    return NextResponse.json(
      { message: "Failed to fetch service details" },
      { status: 500 }
    );
  }
}

// ========================================
// PATCH /api/services/:id — TECHNICIAN
// Technician can update their own service
// ========================================
export async function PATCH(req: Request, { params }: Params) {
  try {
    const auth = await requireApiAuth("technician");

    if (!auth.ok) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status }
      );
    }

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { id } = await params;

    return proxyBackend(`/services/${id}`, auth.token, {
      method: "PATCH",
      body,
    });
  } catch (error) {
    console.error("Update service error:", error);

    return NextResponse.json(
      { message: "Failed to update service" },
      { status: 500 }
    );
  }
}

// ========================================
// DELETE /api/services/:id — TECHNICIAN
// Technician can delete their own service
// ========================================
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireApiAuth("technician");

    if (!auth.ok) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status }
      );
    }

    const { id } = await params;

    return proxyBackend(`/services/${id}`, auth.token, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Delete service error:", error);

    return NextResponse.json(
      { message: "Failed to delete service" },
      { status: 500 }
    );
  }
}