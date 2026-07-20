import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";

type Params = { params: Promise<{ id: string; taskId: string; subtaskId: string }> };

/**
 * @summary Unlink a subtask from its parent.
 * Deletes only the `TaskSubtask` join record — the child Task is NOT deleted
 * and remains an independent task in the project. To also delete the child
 * task, call `DELETE /api/admin/projects/:id/tasks/:subtaskId` separately.
 *
 * URL semantics: `:subtaskId` is the `childTaskId` on the join record.
 * The composite PK is `(parentTaskId=taskId, childTaskId=subtaskId)`.
 *
 * @param id       - The project ID (ownership guard)
 * @param taskId   - The parent task ID
 * @param subtaskId - The child task ID (= childTaskId on the join record)
 * @returns 200 on success, 404 if the join record doesn't exist
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, taskId, subtaskId } = await params;

    // Verify the join record exists and the parent task belongs to this project.
    // One query covers both checks via the nested `parentTask.projectId` filter.
    const existing = await prisma.taskSubtask.findFirst({
      where: {
        parentTaskId: taskId,
        childTaskId: subtaskId,
        parentTask: { projectId },
      },
      select: { parentTaskId: true, childTaskId: true },
    });
    if (!existing) return apiError("Subtask link not found", 404);

    // Delete only the join record using the composite PK
    await prisma.taskSubtask.delete({
      where: {
        parentTaskId_childTaskId: {
          parentTaskId: taskId,
          childTaskId: subtaskId,
        },
      },
    });

    return apiSuccess(null, "Subtask unlinked successfully", 200);
  } catch (error) {
    console.error(
      "[DELETE /api/admin/projects/:id/tasks/:taskId/subtasks/:subtaskId]",
      error,
    );
    return apiError("Failed to unlink subtask", 500);
  }
}