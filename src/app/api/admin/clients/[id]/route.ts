// src/app/api/admin/clients/[id]/route.ts
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { clientBaseSchema } from "@/features/admin/clients/validations/clients.validation";
import { apiSuccess, apiError } from "@/lib/api";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import crypto from "crypto";

type Params = { params: Promise<{ id: string }> };

const clientInclude = {
  _count: { select: { projects: true } },
  projects: {
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      thumbnailUrl: true,
    },
    orderBy: { createdAt: "desc" as const },
  },
};

/**
 * @summary Get a client by ID
 * @param id - The ID of the client
 * @returns The client data with projects or an error message
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: clientInclude,
    });

    if (!client) return apiError("Client not found", 404);

    return apiSuccess(client, "Client fetched successfully");
  } catch (error) {
    console.error("[GET /api/admin/clients/:id]", error);
    return apiError("Failed to fetch client", 500);
  }
}

/**
 * @summary Update a client by ID
 * @param id - The ID of the client
 * @param request - The updated fields
 * @returns The updated client data or an error message
 */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id } = await params;
    const body = await request.json();

    const validation = clientBaseSchema.partial().safeParse(body);
    if (!validation.success) {
      return apiError(
        validation.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(", "),
        400,
      );
    }

    const client = await prisma.client.update({
      where: { id },
      data: { ...validation.data, updatedAt: new Date() },
      include: clientInclude,
    });

    return apiSuccess(client, "Client updated successfully");
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return apiError("Client not found", 404);
    }
    console.error("[PATCH /api/admin/clients/:id]", error);
    return apiError("Failed to update client", 500);
  }
}

/**
 * @summary Delete a client by ID
 * @param id - The ID of the client
 * @returns A success message or an error message
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id } = await params;

    await prisma.client.delete({ where: { id } });

    return apiSuccess(null, "Client deleted successfully");
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return apiError("Client not found", 404);
    }
    console.error("[DELETE /api/admin/clients/:id]", error);
    return apiError("Failed to delete client", 500);
  }
}

/**
 * @summary Regenerate access token for a client
 * @param id - The ID of the client
 * @param expiresInDays - Number of days until token expires (default: 30)
 * @returns The updated client with new access token or an error message
 */
export async function PUT(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id } = await params;
    const body = await request.json();
    const expiresInDays: number = body.expiresInDays ?? 30;

    const accessToken = crypto.randomBytes(32).toString("hex");
    const accessExpiresAt = new Date();
    accessExpiresAt.setDate(accessExpiresAt.getDate() + expiresInDays);

    const client = await prisma.client.update({
      where: { id },
      data: { accessToken, accessExpiresAt, updatedAt: new Date() },
      include: clientInclude,
    });

    return apiSuccess(client, "Access token regenerated successfully");
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return apiError("Client not found", 404);
    }
    console.error("[PUT /api/admin/clients/:id]", error);
    return apiError("Failed to regenerate token", 500);
  }
}
