import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import { taskCommentCreateSchema } from "@/features/admin/tasks/validations";
import {
  ActivityAction,
  ActivityActorType,
} from "@/app/generated/prisma/enums";
import { logTaskActivity } from "@/lib/activity/logTaskActivity";

type Params = { params: Promise<{ id: string; taskId: string }> };

/**
 * @summary: Get comments for a task
 * @param: id - The ID of the project
 * @param: taskId - The ID of the task
 * @returns: List of comments
 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, taskId } = await params;

    // Verify task belongs to the project
    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      select: { id: true },
    });
    if (!task) return apiError("Task not found", 404);

    const comments = await prisma.taskComment.findMany({
      where: { taskId },
      orderBy: { createdAt: "asc" },
    });

    return apiSuccess(comments, "Comments fetched successfully", 200);
  } catch (error) {
    console.error(
      "[GET /api/admin/projects/:id/tasks/:taskId/comments]",
      error,
    );
    return apiError("Failed to fetch comments", 500);
  }
}

/**
 * @summary: Create a comment on a task
 * @param: id - The ID of the project
 * @param: taskId - The ID of the task
 * @returns: The created comment
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, taskId } = await params;

    // Verify task belongs to the project
    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      select: { id: true },
    });
    if (!task) return apiError("Task not found", 404);

    const body = await request.json();
    const validation = taskCommentCreateSchema.safeParse(body);

    if (!validation.success) {
      return apiError(
        validation.error.issues.map((i) => i.message).join(", "),
        400,
      );
    }

    const comment = await prisma.$transaction(async (tx) => {
      const created = await tx.taskComment.create({
        data: {
          taskId,
          parentId: validation.data.parentId || null,
          authorType: ActivityActorType.ADMIN,
          authorUserId: user.id,
          body: validation.data.body,
        },
      });

      await logTaskActivity(tx, {
        projectId,
        taskId,
        action: ActivityAction.COMMENT_ADDED,
        actorUserId: user.id,
        diff: { body: { from: null, to: validation.data.body } },
      });

      return created;
    });

    return apiSuccess(comment, "Comment created successfully", 201);
  } catch (error) {
    console.error(
      "[POST /api/admin/projects/:id/tasks/:taskId/comments]",
      error,
    );
    return apiError("Failed to create comment", 500);
  }
}
