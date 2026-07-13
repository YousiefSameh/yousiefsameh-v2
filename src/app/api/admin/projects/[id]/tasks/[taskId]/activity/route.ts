import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import { parseQueryParams } from "@/lib/parseQueryParams";
import { ActivityEntityType } from "@/app/generated/prisma/enums";
import z from "zod";

type Params = { params: Promise<{ id: string; taskId: string }> };

const activityQuerySchema = z.object({
  page:  z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

/**
 * @summary Get paginated activity log entries for a task.
 * Read-only — activity records are written server-side by mutation handlers,
 * never by the client. Returns entries ordered newest-first.
 *
 * @param id     - The project ID (ownership guard)
 * @param taskId - The task entity ID to filter on
 * @query page   - Page number (default: 1)
 * @query limit  - Items per page (default: 20, max: 100)
 */
export async function GET(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, taskId } = await params;

    // Verify the task belongs to this project before returning its activity
    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      select: { id: true },
    });
    if (!task) return apiError("Task not found", 404);

    const { searchParams } = new URL(request.url);
    const parsed = parseQueryParams(activityQuerySchema, searchParams);
    if (!parsed.success) return apiError(parsed.error, 400);

    const { page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const [total, logs] = await prisma.$transaction([
      prisma.activityLog.count({
        where: { entityType: ActivityEntityType.TASK, entityId: taskId },
      }),
      prisma.activityLog.findMany({
        where: { entityType: ActivityEntityType.TASK, entityId: taskId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return apiSuccess(logs, "Activity fetched successfully", 200, {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error(
      "[GET /api/admin/projects/:id/tasks/:taskId/activity]",
      error,
    );
    return apiError("Failed to fetch activity", 500);
  }
}