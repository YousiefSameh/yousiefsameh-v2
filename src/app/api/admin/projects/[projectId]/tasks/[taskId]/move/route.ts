import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import { taskMoveSchema } from "@/validations/tasks.validation";

type Params = { params: Promise<{ projectId: string; taskId: string }> };

/**
 * Reorders tasks within a status column and optionally moves a task into it.
 *
 * Payload is the full ordered list of task IDs for the destination status.
 * This keeps the API simple and makes optimistic UI straightforward.
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { projectId, taskId } = await params;
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
      // Ensure the task belongs to the project.
      const existing = await tx.task.findFirst({
        where: { id: taskId, projectId },
        select: { id: true },
      });
      if (!existing) throw new Error("TASK_NOT_FOUND");

      // Move + renumber the entire destination column in one go.
      await Promise.all(
        orderedTaskIds.map((id, idx) =>
          tx.task.update({
            where: { id },
            data: { status, displayOrder: idx, updatedAt: new Date() },
          }),
        ),
      );
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

