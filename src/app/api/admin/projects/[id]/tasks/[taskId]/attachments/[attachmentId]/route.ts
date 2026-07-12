import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";

type Params = { params: Promise<{ id: string; taskId: string; attachmentId: string }> };

/**
 * @summary: Delete a specific attachment record
 * @param: id - The ID of the project
 * @param: taskId - The ID of the task
 * @param: attachmentId - The ID of the attachment
 * @returns: Success status
 */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, taskId, attachmentId } = await params;

    // Verify task belongs to the project
    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      select: { id: true },
    });
    if (!task) return apiError("Task not found", 404);

    const attachment = await prisma.taskAttachment.findFirst({
      where: { id: attachmentId, taskId },
    });
    if (!attachment) return apiError("Attachment not found", 404);

    await prisma.taskAttachment.delete({ where: { id: attachmentId } });

    return apiSuccess(true, "Attachment deleted successfully", 200);
  } catch (error) {
    console.error(
      "[DELETE /api/admin/projects/:id/tasks/:taskId/attachments/:attachmentId]",
      error,
    );
    return apiError("Failed to delete attachment", 500);
  }
}
