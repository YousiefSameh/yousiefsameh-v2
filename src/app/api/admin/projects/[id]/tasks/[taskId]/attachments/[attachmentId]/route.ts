import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import { deleteImage } from "@/lib/upload";

type Params = { params: Promise<{ id: string; taskId: string; attachmentId: string }> };

/**
 * @summary Delete an attachment by ID.
 * Verifies the attachment belongs to the task and project before deleting.
 * The DB record is deleted first; S3 cleanup is fire-and-forget so the
 * response is never blocked by a slow S3 call.
 * @param id - The ID of the project
 * @param taskId - The ID of the task
 * @param attachmentId - The ID of the attachment
 * @returns Success status or an error message
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, taskId, attachmentId } = await params;

    // Verify ownership: attachment → task → project
    const attachment = await prisma.taskAttachment.findFirst({
      where: {
        id: attachmentId,
        taskId,
        task: { projectId },
      },
      select: { id: true, filePath: true },
    });
    if (!attachment) return apiError("Attachment not found", 404);

    // Delete DB record first — client gets a response immediately
    await prisma.taskAttachment.delete({ where: { id: attachmentId } });

    // Fire-and-forget S3 cleanup: do not await, do not block the response.
    // If S3 deletion fails, the orphaned object is harmless and can be cleaned
    // up via S3 lifecycle rules.
    void deleteImage(attachment.filePath).catch((err) =>
      console.error("[DELETE attachment S3 cleanup]", err),
    );

    return apiSuccess(null, "Attachment deleted successfully", 200);
  } catch (error) {
    console.error(
      "[DELETE /api/admin/projects/:id/tasks/:taskId/attachments/:attachmentId]",
      error,
    );
    return apiError("Failed to delete attachment", 500);
  }
}