import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import { taskAttachmentCreateSchema } from "@/features/admin/tasks/validations";

type Params = { params: Promise<{ id: string; reportId: string }> };

/**
 * @summary: Get all attachments for a report, ordered newest-first.
 * @param: id - The ID of the project
 * @param: reportId - The ID of the report
 * @returns: The attachments data or an error message
 */

export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, reportId } = await params;

    const report = await prisma.weeklyReport.findFirst({
      where: { id: reportId, projectId },
      select: { id: true },
    });
    if (!report) return apiError("Report not found", 404);

    const attachments = await prisma.weeklyReportAttachment.findMany({
      where: { reportId },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(attachments, "Attachments fetched successfully", 200);
  } catch (error) {
    console.error(
      "[GET /api/admin/projects/:id/reports/:reportId/attachments]",
      error,
    );
    return apiError("Failed to fetch attachments", 500);
  }
}

/**
 * @summary: Create an attachment record after the client has uploaded to S3.
 * WeeklyReportAttachment has no uploadedByType/uploadedByUserId fields —
 * only the file metadata is stored.
 * @param: id - The ID of the project
 * @param: reportId - The ID of the report
 * @returns: The attachment data or an error message
 */

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, reportId } = await params;
    const body = await request.json();

    const validation = taskAttachmentCreateSchema.safeParse(body);
    if (!validation.success) {
      return apiError(
        validation.error.issues.map((i) => i.message).join(", "),
        400,
      );
    }

    const report = await prisma.weeklyReport.findFirst({
      where: { id: reportId, projectId },
      select: { id: true },
    });
    if (!report) return apiError("Report not found", 404);

    const attachment = await prisma.weeklyReportAttachment.create({
      data: {
        reportId,
        filePath: validation.data.filePath,
        url: validation.data.url,
        fileName: validation.data.fileName,
        mimeType: validation.data.mimeType ?? null,
        sizeBytes: validation.data.sizeBytes ?? null,
      },
    });

    return apiSuccess(attachment, "Attachment created successfully", 201);
  } catch (error) {
    console.error(
      "[POST /api/admin/projects/:id/reports/:reportId/attachments]",
      error,
    );
    return apiError("Failed to create attachment", 500);
  }
}
