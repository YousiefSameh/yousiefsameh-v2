import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import {
  ActivityAction,
  ActivityActorType,
  ActivityEntityType,
} from "@/app/generated/prisma/enums";
import { buildActivityCreateData } from "@/lib/activity/log";
import z from "zod";

type Params = { params: Promise<{ id: string; reportId: string; commentId: string }> };

const updateCommentSchema = z.object({
  body: z.any(),
});

/**
 * @summary: Update a report comment's body.
 * @param: id - The ID of the project
 * @param: reportId - The ID of the report
 * @param: commentId - The ID of the comment
 * @returns: The updated comment data or an error message
 */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: _projectId, reportId, commentId } = await params;
    const body = await request.json();

    const validation = updateCommentSchema.safeParse(body);
    if (!validation.success) {
      return apiError("Invalid request body", 400);
    }

    const existing = await prisma.weeklyReportComment.findFirst({
      where: { id: commentId, reportId, deletedAt: null },
      select: { id: true },
    });
    if (!existing) return apiError("Comment not found", 404);

    const comment = await prisma.weeklyReportComment.update({
      where: { id: commentId },
      data:  { body: validation.data.body, updatedAt: new Date() },
      include: {
        replies: { where: { deletedAt: null }, orderBy: { createdAt: "asc" } },
      },
    });

    return apiSuccess(comment, "Comment updated successfully", 200);
  } catch (error) {
    console.error(
      "[PATCH /api/admin/projects/:id/reports/:reportId/comments/:commentId]",
      error,
    );
    return apiError("Failed to update comment", 500);
  }
}

/**
 * @summary: Soft-delete a report comment.
 * Sets deletedAt to preserve thread structure when replies exist.
 * Emits COMMENT_DELETED activity log inside the same transaction.
 * @param: id - The ID of the project
 * @param: reportId - The ID of the report
 * @param: commentId - The ID of the comment
 * @returns: The deleted comment data or an error message
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, reportId, commentId } = await params;

    const existing = await prisma.weeklyReportComment.findFirst({
      where: {
        id:       commentId,
        reportId,
        report:   { projectId },
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!existing) return apiError("Comment not found", 404);

    const comment = await prisma.$transaction(async (tx) => {
      const deleted = await tx.weeklyReportComment.update({
        where: { id: commentId },
        data:  { deletedAt: new Date() },
      });

      await tx.activityLog.create({
        data: buildActivityCreateData({
          projectId,
          entityType:  ActivityEntityType.REPORT,
          entityId:    reportId,
          action:      ActivityAction.COMMENT_DELETED,
          actorType:   ActivityActorType.ADMIN,
          actorUserId: user.id,
        }),
      });

      return deleted;
    });

    return apiSuccess(comment, "Comment deleted successfully", 200);
  } catch (error) {
    console.error(
      "[DELETE /api/admin/projects/:id/reports/:reportId/comments/:commentId]",
      error,
    );
    return apiError("Failed to delete comment", 500);
  }
}