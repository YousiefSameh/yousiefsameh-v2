import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import { parseQueryParams } from "@/lib/parseQueryParams";
import z from "zod";

type Params = { params: Promise<{ id: string }> };

const activityQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

/**
 * @summary: Get activity logs for a project by ID
 * @param: id - The ID of the project
 * @param: request - the search query params
 * @returns: The activity logs data or an error message
 */
export async function GET(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId } = await params;
    if (!projectId) return apiError("Project ID is required", 400);

    const { searchParams } = new URL(request.url);
    const parsed = parseQueryParams(activityQuerySchema, searchParams);
    if (!parsed.success) return apiError(parsed.error, 400);

    const { page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const [total, rows] = await prisma.$transaction([
      prisma.activityLog.count({ where: { projectId } }),
      prisma.activityLog.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return apiSuccess(rows, "Activity fetched successfully", 200, {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("[GET /api/admin/projects/:projectId/activity]", error);
    return apiError("Failed to fetch activity", 500);
  }
}
