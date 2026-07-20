import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import { parseQueryParams } from "@/lib/parseQueryParams";
import {
  taskBaseSchema,
  taskQuerySchema,
} from "@/features/admin/tasks/validations";
import { Prisma } from "@/app/generated/prisma/client";

type Params = { params: Promise<{ id: string }> };

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
 * @summary: Get all tasks for a project by ID
 * @param: id - The ID of the project
 * @param: request - the search query params
 * @returns: The tasks data or an error message
 */
export async function GET(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId } = await params;
    if (!projectId) return apiError("Project ID is required", 400);

    const { searchParams } = new URL(request.url);
    const parsed = parseQueryParams(taskQuerySchema, searchParams);
    if (!parsed.success) return apiError(parsed.error, 400);

    const { status, priority, type, assigneeId, labelId, search } = parsed.data;

    const where: Prisma.TaskWhereInput = {
      projectId,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(type && { type }),
      ...(assigneeId && { assigneeId }),
      ...(labelId && { labels: { some: { labelId } } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const tasks = await prisma.task.findMany({
      where,
      include: taskInclude,
      orderBy: [
        { status: "asc" },
        { displayOrder: "asc" },
        { createdAt: "asc" },
      ],
    });

    return apiSuccess(tasks, "Tasks fetched successfully", 200);
  } catch (error) {
    console.error("[GET /api/admin/projects/:projectId/tasks]", error);
    return apiError("Failed to fetch tasks", 500);
  }
}

/**
 * @summary: Create a task for a project by ID
 * @param: id - The ID of the project
 * @param: request - the task data
 * @returns: The created task data or an error message
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId } = await params;
    const body = await request.json();

    const validation = taskBaseSchema.safeParse({ ...body, projectId });
    if (!validation.success) {
      return apiError(
        validation.error.issues.map((i) => i.message).join(", "),
        400,
      );
    }

    const { labelIds, ...data } = validation.data;

    const task = await prisma.task.create({
      data: {
        ...data,
        labels: labelIds?.length
          ? {
              createMany: {
                data: labelIds.map((labelId) => ({ labelId })),
                skipDuplicates: true,
              },
            }
          : undefined,
      },
      include: taskInclude,
    });

    return apiSuccess(task, "Task created successfully", 201);
  } catch (error) {
    console.error("[POST /api/admin/projects/:projectId/tasks]", error);
    return apiError("Failed to create task", 500);
  }
}
