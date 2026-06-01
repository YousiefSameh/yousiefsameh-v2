import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import { taskBaseSchema } from "@/validations/tasks.validation";
import { Prisma } from "@/app/generated/prisma/client";

type Params = { params: Promise<{ id: string; taskId: string }> };

const taskInclude = {
  labels: {
    include: {
      label: true,
    },
  },
  _count: {
    select: {
      comments: true,
      attachments: true,
    },
  },
} satisfies Prisma.TaskInclude;

/**
 * @summary: Get a task by ID
 * @param: id - The ID of the project
 * @param: taskId - The ID of the task
 * @returns: The task data or an error message
 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, taskId } = await params;

    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      include: taskInclude,
    });

    if (!task) return apiError("Task not found", 404);

    return apiSuccess(task, "Task fetched successfully", 200);
  } catch (error) {
    console.error("[GET /api/admin/projects/:projectId/tasks/:taskId]", error);
    return apiError("Failed to fetch task", 500);
  }
}

/**
 * @summary: Update a task by ID
 * @param: id - The ID of the project
 * @param: taskId - The ID of the task
 * @param: request - the updated task data
 * @returns: The updated task data or an error message
 */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, taskId } = await params;
    const body = await request.json();

    const validation = taskBaseSchema
      .omit({ projectId: true })
      .partial()
      .safeParse(body);

    if (!validation.success) {
      return apiError(
        validation.error.issues.map((i) => i.message).join(", "),
        400,
      );
    }

    const { labelIds, ...data } = validation.data;

    const updated = await prisma.$transaction(async (tx) => {
      if (labelIds) {
        await tx.taskLabelAssignment.deleteMany({ where: { taskId } });
        if (labelIds.length) {
          await tx.taskLabelAssignment.createMany({
            data: labelIds.map((labelId) => ({ taskId, labelId })),
            skipDuplicates: true,
          });
        }
      }

      return tx.task.update({
        where: { id: taskId },
        data: { ...data, updatedAt: new Date() },
        include: taskInclude,
      });
    });

    if (updated.projectId !== projectId) return apiError("Task not found", 404);

    return apiSuccess(updated, "Task updated successfully", 200);
  } catch (error) {
    console.error("[PATCH /api/admin/projects/:projectId/tasks/:taskId]", error);
    return apiError("Failed to update task", 500);
  }
}

/**
 * @summary: Delete a task by ID
 * @param: id - The ID of the project
 * @param: taskId - The ID of the task
 * @returns: A success status or error message
 */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, taskId } = await params;

    const existing = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      select: { id: true },
    });
    if (!existing) return apiError("Task not found", 404);

    await prisma.task.delete({ where: { id: taskId } });
    return apiSuccess(true, "Task deleted successfully", 200);
  } catch (error) {
    console.error("[DELETE /api/admin/projects/:projectId/tasks/:taskId]", error);
    return apiError("Failed to delete task", 500);
  }
}
