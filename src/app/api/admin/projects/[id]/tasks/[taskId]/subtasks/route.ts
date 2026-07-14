import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import { taskSubtaskCreateSchema } from "@/features/admin/tasks/validations";

type Params = { params: Promise<{ id: string; taskId: string }> };

/**
 * The fields we select on the child Task when returning subtask data.
 * Kept minimal — the drawer checklist only needs status, title, and id.
 * Excludes descriptionRich (large JSON) to keep the payload small.
 */
const childTaskSelect = {
  id: true,
  title: true,
  status: true,
  priority: true,
  type: true,
  displayOrder: true,
  createdAt: true,
  updatedAt: true,
  projectId: true,
  description: true,
  dueDate: true,
  assigneeId: true,
  isClientVisible: true,
} as const;

/**
 * @summary Get all subtasks for a task (children of the parent task).
 * Returns `TaskSubtask` join records with the full child `Task` included,
 * ordered by `displayOrder asc` then `createdAt asc`.
 * @param id - The ID of the project
 * @param taskId - The parent task ID
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, taskId } = await params;

    // Verify the parent task belongs to this project
    const parentTask = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      select: { id: true },
    });
    if (!parentTask) return apiError("Task not found", 404);

    const subtasks = await prisma.taskSubtask.findMany({
      where: { parentTaskId: taskId },
      include: {
        childTask: { select: childTaskSelect },
      },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });

    return apiSuccess(subtasks, "Subtasks fetched successfully", 200);
  } catch (error) {
    console.error(
      "[GET /api/admin/projects/:id/tasks/:taskId/subtasks]",
      error,
    );
    return apiError("Failed to fetch subtasks", 500);
  }
}

/**
 * @summary Create a new subtask (child Task + TaskSubtask join) in one transaction.
 * The child task is created in the same project with status TODO. The join
 * record links the parent and child.
 * @param id - The ID of the project
 * @param taskId - The parent task ID
 * @param request - { title: string }
 * @returns The created TaskSubtask record with child task included
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, taskId } = await params;
    const body = await request.json();

    const validation = taskSubtaskCreateSchema.safeParse(body);
    if (!validation.success) {
      return apiError(
        validation.error.issues.map((i) => i.message).join(", "),
        400,
      );
    }

    // Verify the parent task belongs to this project
    const parentTask = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      select: { id: true },
    });
    if (!parentTask) return apiError("Task not found", 404);

    const subtask = await prisma.$transaction(async (tx) => {
      // Create the child task in the same project
      const child = await tx.task.create({
        data: {
          projectId,
          title: validation.data.title,
          status: "TODO",
        },
        select: childTaskSelect,
      });

      // Create the join record
      await tx.taskSubtask.create({
        data: {
          parentTaskId: taskId,
          childTaskId: child.id,
        },
      });

      // Return the full join record with the child task included
      return tx.taskSubtask.findUniqueOrThrow({
        where: {
          parentTaskId_childTaskId: {
            parentTaskId: taskId,
            childTaskId: child.id,
          },
        },
        include: {
          childTask: { select: childTaskSelect },
        },
      });
    });

    return apiSuccess(subtask, "Subtask created successfully", 201);
  } catch (error) {
    console.error(
      "[POST /api/admin/projects/:id/tasks/:taskId/subtasks]",
      error,
    );
    return apiError("Failed to create subtask", 500);
  }
}
