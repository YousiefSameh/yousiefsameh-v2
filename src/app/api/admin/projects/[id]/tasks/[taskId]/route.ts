import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import { taskBaseSchema } from "@/features/admin/tasks/validations";
import { Prisma } from "@/app/generated/prisma/client";
import { ActivityAction } from "@/app/generated/prisma/enums";
import { logTaskActivity, ActivityDiff } from "@/lib/activity/logTaskActivity";

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
 * Map from task field name to the ActivityAction that describes a change to it.
 * Only the fields that have dedicated actions are listed — anything else falls
 * back to the generic TASK_UPDATED action.
 */
const FIELD_TO_ACTION: Partial<Record<string, ActivityAction>> = {
  status: ActivityAction.TASK_STATUS_CHANGED,
  priority: ActivityAction.TASK_PRIORITY_CHANGED,
  type: ActivityAction.TASK_TYPE_CHANGED,
  assigneeId: ActivityAction.TASK_ASSIGNEE_CHANGED,
  dueDate: ActivityAction.TASK_DUE_DATE_CHANGED,
  isClientVisible: ActivityAction.TASK_VISIBILITY_CHANGED,
};

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
 * @summary: Update a task by ID.
 * Detects which fields changed and emits one ActivityLog per semantic change
 * (e.g. TASK_STATUS_CHANGED) inside the same transaction as the update.
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
      // Fetch the current task state before mutation so we can diff it
      const before = await tx.task.findFirst({
        where: { id: taskId, projectId },
        select: {
          status: true,
          priority: true,
          type: true,
          assigneeId: true,
          dueDate: true,
          isClientVisible: true,
        },
      });
      if (!before) throw new Error("TASK_NOT_FOUND");

      if (labelIds) {
        await tx.taskLabelAssignment.deleteMany({ where: { taskId } });
        if (labelIds.length) {
          await tx.taskLabelAssignment.createMany({
            data: labelIds.map((labelId) => ({ taskId, labelId })),
            skipDuplicates: true,
          });
        }
      }

      const result = await tx.task.update({
        where: { id: taskId },
        data: { ...data, updatedAt: new Date() },
        include: taskInclude,
      });

      // Emit one activity log entry per changed field that has a dedicated action
      const logPromises: Promise<void>[] = [];

      for (const [field, action] of Object.entries(FIELD_TO_ACTION)) {
        const typedField = field as keyof typeof before;
        const fromValue = before[typedField];
        // data may not contain the field if it wasn't sent in the request
        if (!(field in data)) continue;
        const toValue = (data as Record<string, unknown>)[field];

        // Skip if value didn't actually change (avoids noise in the log)
        const fromStr =
          fromValue instanceof Date
            ? fromValue.toISOString()
            : String(fromValue ?? "");
        const toStr =
          toValue instanceof Date
            ? toValue.toISOString()
            : String(toValue ?? "");
        if (fromStr === toStr) continue;

        const diff: ActivityDiff = {
          [field]: { from: fromValue, to: toValue },
        };
        logPromises.push(
          logTaskActivity(tx, {
            projectId,
            taskId,
            action: action!,
            actorUserId: user.id,
            diff,
          }),
        );
      }

      // Emit TASK_LABELS_CHANGED when labelIds were explicitly provided
      if (labelIds !== undefined) {
        logPromises.push(
          logTaskActivity(tx, {
            projectId,
            taskId,
            action: ActivityAction.TASK_LABELS_CHANGED,
            actorUserId: user.id,
          }),
        );
      }

      await Promise.all(logPromises);

      return result;
    });

    if (updated.projectId !== projectId) return apiError("Task not found", 404);

    return apiSuccess(updated, "Task updated successfully", 200);
  } catch (error) {
    if (error instanceof Error && error.message === "TASK_NOT_FOUND") {
      return apiError("Task not found", 404);
    }
    console.error(
      "[PATCH /api/admin/projects/:projectId/tasks/:taskId]",
      error,
    );
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

    await prisma.$transaction(async (tx) => {
      // Log deletion event before actually deleting
      await logTaskActivity(tx, {
        projectId,
        taskId,
        action: ActivityAction.TASK_DELETED,
        actorUserId: user.id,
      });

      // Now delete the task
      await tx.task.delete({ where: { id: taskId } });
    });
    return apiSuccess(true, "Task deleted successfully", 200);
  } catch (error) {
    console.error(
      "[DELETE /api/admin/projects/:projectId/tasks/:taskId]",
      error,
    );
    return apiError("Failed to delete task", 500);
  }
}
