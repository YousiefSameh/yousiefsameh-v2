import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import { taskAttachmentCreateSchema } from "@/validations/tasks.validation";
import { ActivityActorType } from "@/app/generated/prisma/enums";

type Params = { params: Promise<{ id: string; taskId: string }> };

/**
 * @summary Get all attachments for a task
 * @param id - The ID of the project
 * @param taskId - The ID of the task
 * @returns Attachments ordered newest-first or an error message
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, taskId } = await params;

    // Verify the task belongs to this project before returning attachments
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
    console.error(
      "[GET /api/admin/projects/:id/tasks/:taskId/attachments]",
      error,
    );
    return apiError("Failed to fetch attachments", 500);
  }
}

/**
 * @summary Create an attachment record after the client has uploaded to S3.
 * The client is responsible for the S3 upload (via presigned URL from storage
 * server actions). This endpoint only persists the metadata.
 * @param id - The ID of the project
 * @param taskId - The ID of the task
 * @param request - { filePath, url, fileName, mimeType?, sizeBytes? }
 * @returns The created attachment or an error message
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, taskId } = await params;
    const body = await request.json();

    const validation = taskAttachmentCreateSchema.safeParse(body);
    if (!validation.success) {
      return apiError(
        validation.error.issues.map((i) => i.message).join(", "),
        400,
      );
    }

    // Verify the task belongs to this project before creating attachment
    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      select: { id: true },
    });
    if (!task) return apiError("Task not found", 404);

    const attachment = await prisma.taskAttachment.create({
      data: {
        taskId,
        uploadedByType: ActivityActorType.ADMIN,
        uploadedByUserId: user.id,
        ...validation.data,
      },
    });

    return apiSuccess(attachment, "Attachment created successfully", 201);
  } catch (error) {
    console.error(
      "[POST /api/admin/projects/:id/tasks/:taskId/attachments]",
      error,
    );
    return apiError("Failed to create attachment", 500);
  }
}