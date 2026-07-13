import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import { taskCommentCreateSchema } from "@/validations/tasks.validation";
import { ActivityAction } from "@/app/generated/prisma/enums";
import { logTaskActivity } from "@/lib/activity/logTaskActivity";

type Params = {
  params: Promise<{ id: string; taskId: string; commentId: string }>;
};

/**
 * @summary: Update a specific comment
 * @param: id - The ID of the project
 * @param: taskId - The ID of the task
 * @param: commentId - The ID of the comment
 * @returns: The updated comment
 */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, taskId, commentId } = await params;

    // Verify task belongs to the project
    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      select: { id: true },
    });
    if (!task) return apiError("Task not found", 404);

    const comment = await prisma.taskComment.findFirst({
      where: { id: commentId, taskId },
    });
    if (!comment) return apiError("Comment not found", 404);

    const body = await request.json();
    const validation = taskCommentCreateSchema
      .pick({ body: true })
      .safeParse(body);

    if (!validation.success) {
      return apiError(
        validation.error.issues.map((i) => i.message).join(", "),
        400,
      );
    }

    const updatedComment = await prisma.$transaction(async (tx) => {
      const updated = await tx.taskComment.update({
        where: { id: commentId },
        data: {
          body: validation.data.body,
          updatedAt: new Date(),
        },
      });

      await logTaskActivity(tx, {
        projectId,
        taskId,
        action: ActivityAction.COMMENT_UPDATED,
        actorUserId: user.id,
        diff: { body: { from: comment.body, to: validation.data.body } },
      });

      return updated;
    });

    return apiSuccess(updatedComment, "Comment updated successfully", 200);
  } catch (error) {
    console.error(
      "[PATCH /api/admin/projects/:id/tasks/:taskId/comments/:commentId]",
      error,
    );
    return apiError("Failed to update comment", 500);
  }
}

/**
 * @summary: Soft-delete a specific comment
 * @param: id - The ID of the project
 * @param: taskId - The ID of the task
 * @param: commentId - The ID of the comment
 * @returns: Success status
 */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, taskId, commentId } = await params;

    // Verify task belongs to the project
    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      select: { id: true },
    });
    if (!task) return apiError("Task not found", 404);

    const comment = await prisma.taskComment.findFirst({
      where: { id: commentId, taskId },
    });
    if (!comment) return apiError("Comment not found", 404);

    await prisma.taskComment.update({
      where: { id: commentId },
      data: {
        deletedAt: new Date(),
      },
    });

    return apiSuccess(true, "Comment deleted successfully", 200);
  } catch (error) {
    console.error(
      "[DELETE /api/admin/projects/:id/tasks/:taskId/comments/:commentId]",
      error,
    );
    return apiError("Failed to delete comment", 500);
  }
}
