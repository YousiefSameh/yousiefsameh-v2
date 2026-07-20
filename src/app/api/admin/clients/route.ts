import prisma from "@/lib/prisma";
import { Client, Prisma } from "@/app/generated/prisma/client";
import { requireAdmin } from "@/lib/requireAdmin";
import {
  clientBaseSchema,
  clientQuerySchema,
} from "@/features/admin/clients/validations/clients.validation";
import { APIResult } from "@/lib/types";
import { apiSuccess, apiError } from "@/lib/api";
import { parseQueryParams } from "@/lib/parseQueryParams";
import crypto from "crypto";

/**
 * @summary Get all clients (for admin)
 * @param page - The page number
 * @param limit - The number of clients per page
 * @param search - Search by name, email, or company
 * @param tag - Filter by tag
 * @returns The data and pagination info or an error message
 */
export async function GET(request: Request): Promise<APIResult<Client[]>> {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(request.url);
    const parsed = parseQueryParams(clientQuerySchema, searchParams);
    if (!parsed.success) return apiError(parsed.error, 400);

    const { page, limit, search, tag } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Prisma.ClientWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { company: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(tag && { tags: { has: tag } }),
    };

    const [total, clients] = await prisma.$transaction([
      prisma.client.count({ where }),
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { projects: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return apiSuccess(clients, "Clients fetched successfully", 200, {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("[GET /api/admin/clients]", error);
    return apiError("Failed to fetch clients", 500);
  }
}

/**
 * @summary Create a new client
 * @param request - The client fields
 * @returns The created client data or an error message
 */
export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const body = await request.json();
    const validation = clientBaseSchema.safeParse(body);
    if (!validation.success) {
      return apiError(
        validation.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(", "),
        400,
      );
    }

    const accessToken = crypto.randomBytes(32).toString("hex");
    const accessExpiresAt = new Date();
    accessExpiresAt.setDate(accessExpiresAt.getDate() + 30);

    const client = await prisma.client.create({
      data: {
        ...validation.data,
        accessToken,
        accessExpiresAt,
      },
      include: { _count: { select: { projects: true } } },
    });

    return apiSuccess(client, "Client created successfully", 201);
  } catch (error) {
    console.error("[POST /api/admin/clients]", error);
    return apiError("Failed to create client", 500);
  }
}
