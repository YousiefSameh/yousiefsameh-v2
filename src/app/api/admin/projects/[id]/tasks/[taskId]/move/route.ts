import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import { taskMoveSchema } from "@/features/admin/tasks/validations";
import { ActivityAction } from "@/app/generated/prisma/enums";
import { logTaskActivity } from "@/lib/activity/logTaskActivity";

type Params = { params: Promise<{ id: string; taskId: string }> };

/**
 * @summary: Move a task to a new status column and reorder tasks within it.
 * Emits a TASK_MOVED activity log entry recording the before/after status.
 * @param: id - The ID of the project
 * @param: taskId - The ID of the task being moved
 * @param: request - { status, orderedTaskIds }
 * @returns: A success status or error message
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, taskId } = await params;
    const body = await request.json();

    const validation = taskMoveSchema.safeParse(body);
    if (!validation.success) {
      return apiError(
        validation.error.issues.map((i) => i.message).join(", "),
        400,
      );
    }

    const { status, orderedTaskIds } = validation.data;
    if (!orderedTaskIds.includes(taskId)) {
      return apiError("orderedTaskIds must include the moved taskId", 400);
    }

    await prisma.$transaction(async (tx) => {
      const existing = await tx.task.findFirst({
        where: { id: taskId, projectId },
        select: { id: true, status: true },
      });
      if (!existing) throw new Error("TASK_NOT_FOUND");

      await Promise.all(
        orderedTaskIds.map((id, idx) =>
          tx.task.update({
            where: { id },
            data: { status, displayOrder: idx, updatedAt: new Date() },
          }),
        ),
      );

      // Only log if the status actually changed (reordering within same column
      // should not produce a TASK_MOVED entry)
      if (existing.status !== status) {
        await logTaskActivity(tx, {
          projectId,
          taskId,
          action: ActivityAction.TASK_MOVED,
          actorUserId: user.id,
          diff: { status: { from: existing.status, to: status } },
        });
      }
    });

    return apiSuccess(true, "Task moved successfully", 200);
  } catch (error) {
    if (error instanceof Error && error.message === "TASK_NOT_FOUND") {
      return apiError("Task not found", 404);
    }
    console.error(
      "[POST /api/admin/projects/:projectId/tasks/:taskId/move]",
      error,
    );
    return apiError("Failed to move task", 500);
  }
}
