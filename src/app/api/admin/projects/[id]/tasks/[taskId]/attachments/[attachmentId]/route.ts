import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import { deleteImage } from "@/lib/upload";
import { ActivityAction } from "@/app/generated/prisma/enums";
import { logTaskActivity } from "@/lib/activity/logTaskActivity";

type Params = { params: Promise<{ id: string; taskId: string; attachmentId: string }> };

/**
 * @summary Delete an attachment by ID.
 * Emits a FILE_DELETED activity log entry inside the same transaction as the
 * DB delete. S3 cleanup remains fire-and-forget after the transaction commits.
 * @param id           - The project ID
 * @param taskId       - The task ID
 * @param attachmentId - The attachment ID
 * @returns 200 on success, 404 if not found
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, taskId, attachmentId } = await params;

    const attachment = await prisma.taskAttachment.findFirst({
      where: {
        id: attachmentId,
        taskId,
        task: { projectId },
      },
      select: { id: true, filePath: true, fileName: true },
    });
    if (!attachment) return apiError("Attachment not found", 404);

    // Delete DB record and write activity log atomically
    await prisma.$transaction(async (tx) => {
      await tx.taskAttachment.delete({ where: { id: attachmentId } });

      await logTaskActivity(tx, {
        projectId,
        taskId,
        action:      ActivityAction.FILE_DELETED,
        actorUserId: user.id,
        diff:        { fileName: { from: attachment.fileName, to: null } },
      });
    });

    // Fire-and-forget S3 cleanup after transaction commits
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