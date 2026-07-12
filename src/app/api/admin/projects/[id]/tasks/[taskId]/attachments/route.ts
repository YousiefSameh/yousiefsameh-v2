import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import z from "zod";

type Params = { params: Promise<{ id: string; taskId: string }> };

const attachmentCreateSchema = z.object({
  filePath: z.string().min(1),
  url: z.string().url(),
  fileName: z.string().min(1),
  mimeType: z.string().optional().nullable(),
  sizeBytes: z.number().int().positive().optional().nullable(),
});

/**
 * @summary: Get attachments for a task
 * @param: id - The ID of the project
 * @param: taskId - The ID of the task
 * @returns: List of attachments ordered by createdAt desc
 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, taskId } = await params;

    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      select: { id: true },
    });
    if (!task) return apiError("Task not found", 404);

    const attachments = await prisma.taskAttachment.findMany({
      where: { taskId },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(attachments, "Attachments fetched successfully", 200);
  } catch (error) {
    console.error("[GET /api/admin/projects/:id/tasks/:taskId/attachments]", error);
    return apiError("Failed to fetch attachments", 500);
  }
}

/**
 * @summary: Register a new attachment record for a task
 * @param: id - The ID of the project
 * @param: taskId - The ID of the task
 * @returns: The created attachment metadata
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, taskId } = await params;

    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      select: { id: true },
    });
    if (!task) return apiError("Task not found", 404);

    const body = await request.json();
    const validation = attachmentCreateSchema.safeParse(body);

    if (!validation.success) {
      return apiError(
        validation.error.issues.map((i) => i.message).join(", "),
        400,
      );
    }

    const attachment = await prisma.taskAttachment.create({
      data: {
        taskId,
        uploadedByType: "ADMIN",
        uploadedByUserId: user.id,
        filePath: validation.data.filePath,
        url: validation.data.url,
        fileName: validation.data.fileName,
        mimeType: validation.data.mimeType ?? null,
        sizeBytes: validation.data.sizeBytes ?? null,
      },
    });

    return apiSuccess(attachment, "Attachment created successfully", 201);
  } catch (error) {
    console.error("[POST /api/admin/projects/:id/tasks/:taskId/attachments]", error);
    return apiError("Failed to create attachment", 500);
  }
}
