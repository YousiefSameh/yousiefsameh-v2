import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import { taskCommentCreateSchema } from "@/features/admin/tasks/validations";
import {
  ActivityAction,
  ActivityActorType,
  ActivityEntityType,
} from "@/app/generated/prisma/enums";
import { buildActivityCreateData } from "@/lib/activity/log";

type Params = { params: Promise<{ id: string; reportId: string }> };

/**
 * @summary: Get all top-level comments for a report, with one level of replies.
 * Filters out soft-deleted entries (deletedAt != null).
 * @param: id - The ID of the project
 * @param: reportId - The ID of the report
 * @returns: The comments data or an error message
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, reportId } = await params;

    const report = await prisma.weeklyReport.findFirst({
      where: { id: reportId, projectId },
      select: { id: true },
    });
    if (!report) return apiError("Report not found", 404);

    const comments = await prisma.weeklyReportComment.findMany({
      where: { reportId, parentId: null, deletedAt: null },
      include: {
        replies: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return apiSuccess(comments, "Comments fetched successfully", 200);
  } catch (error) {
    console.error(
      "[GET /api/admin/projects/:id/reports/:reportId/comments]",
      error,
    );
    return apiError("Failed to fetch comments", 500);
  }
}

/**
 * @summary: Create a comment on a report.
 * Accepts optional parentId for threaded replies.
 * Emits COMMENT_ADDED activity log inside the same transaction.
 * @param: id - The ID of the project
 * @param: reportId - The ID of the report
 * @returns: The comment data or an error message
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, reportId } = await params;
    const body = await request.json();

    const validation = taskCommentCreateSchema.safeParse(body);
    if (!validation.success) {
      return apiError(
        validation.error.issues.map((i) => i.message).join(", "),
        400,
      );
    }

    const report = await prisma.weeklyReport.findFirst({
      where: { id: reportId, projectId },
      select: { id: true },
    });
    if (!report) return apiError("Report not found", 404);

    const comment = await prisma.$transaction(async (tx) => {
      const created = await tx.weeklyReportComment.create({
        data: {
          reportId,
          parentId: validation.data.parentId ?? null,
          authorType: ActivityActorType.ADMIN,
          authorUserId: user.id,
          body: validation.data.body,
        },
        include: {
          replies: {
            where: { deletedAt: null },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      await tx.activityLog.create({
        data: buildActivityCreateData({
          projectId,
          entityType: ActivityEntityType.REPORT,
          entityId: reportId,
          action: ActivityAction.COMMENT_ADDED,
          actorType: ActivityActorType.ADMIN,
          actorUserId: user.id,
        }),
      });

      return created;
    });

    return apiSuccess(comment, "Comment created successfully", 201);
  } catch (error) {
    console.error(
      "[POST /api/admin/projects/:id/reports/:reportId/comments]",
      error,
    );
    return apiError("Failed to create comment", 500);
  }
}
