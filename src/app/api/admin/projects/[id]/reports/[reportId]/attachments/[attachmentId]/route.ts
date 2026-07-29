import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import { deleteImage } from "@/lib/upload";

type Params = {
  params: Promise<{ id: string; reportId: string; attachmentId: string }>;
};

/**
 * @summary: Delete a report attachment.
 * @description: Verifies the attachment belongs to the report and project before deleting.
 * DB record is deleted first; S3 cleanup is fire-and-forget.
 * @param: id - The ID of the project
 * @param: reportId - The ID of the report
 * @param: attachmentId - The ID of the attachment
 * @returns: The attachment data or an error message
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, reportId, attachmentId } = await params;

    const attachment = await prisma.weeklyReportAttachment.findFirst({
      where: {
        id: attachmentId,
        reportId,
        report: { projectId },
      },
      select: { id: true, filePath: true },
    });
    if (!attachment) return apiError("Attachment not found", 404);

    await prisma.weeklyReportAttachment.delete({ where: { id: attachmentId } });

    // Fire-and-forget S3 cleanup
    void deleteImage(attachment.filePath).catch((err) =>
      console.error("[DELETE report attachment S3 cleanup]", err),
    );

    return apiSuccess(null, "Attachment deleted successfully", 200);
  } catch (error) {
    console.error(
      "[DELETE /api/admin/projects/:id/reports/:reportId/attachments/:attachmentId]",
      error,
    );
    return apiError("Failed to delete attachment", 500);
  }
}
