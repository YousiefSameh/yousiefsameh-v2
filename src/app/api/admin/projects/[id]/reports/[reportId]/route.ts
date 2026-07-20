import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import { reportBaseSchema } from "@/features/admin/reports/validations";
import { Prisma } from "@/app/generated/prisma/client";
import {
  ActivityAction,
  ActivityEntityType,
  ActivityActorType,
} from "@/app/generated/prisma/enums";
import { buildActivityCreateData } from "@/lib/activity/log";

type Params = { params: Promise<{ id: string; reportId: string }> };

const reportInclude = {
  _count: {
    select: {
      comments: true,
      attachments: true,
    },
  },
} satisfies Prisma.WeeklyReportInclude;

/**
 * @summary: Get a report by ID
 * @param: id - The ID of the project
 * @param: reportId - The ID of the report
 * @returns: The report data or an error message
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, reportId } = await params;

    const report = await prisma.weeklyReport.findFirst({
      where: { id: reportId, projectId },
      include: reportInclude,
    });
    if (!report) return apiError("Report not found", 404);

    return apiSuccess(report, "Report fetched successfully", 200);
  } catch (error) {
    console.error("[GET /api/admin/projects/:id/reports/:reportId]", error);
    return apiError("Failed to fetch report", 500);
  }
}

/**
 * @summary: Update a report by ID.
 * Detects which fields changed and emits one ActivityLog per semantic change
 * (e.g. REPORT_UPDATED) inside the same transaction as the update.
 * @param: id - The ID of the project
 * @param: reportId - The ID of the report
 * @param: request - the updated report data
 * @returns: The updated report data or an error message
 */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, reportId } = await params;
    const body = await request.json();

    const validation = reportBaseSchema.partial().safeParse(body);
    if (!validation.success) {
      return apiError(
        validation.error.issues.map((i) => i.message).join(", "),
        400,
      );
    }

    // Ownership check before mutating
    const existing = await prisma.weeklyReport.findFirst({
      where: { id: reportId, projectId },
      select: { id: true },
    });
    if (!existing) return apiError("Report not found", 404);

    const report = await prisma.$transaction(async (tx) => {
      const updated = await tx.weeklyReport.update({
        where: { id: reportId },
        data: { ...validation.data, updatedAt: new Date() },
        include: reportInclude,
      });

      await tx.activityLog.create({
        data: buildActivityCreateData({
          projectId,
          entityType: ActivityEntityType.REPORT,
          entityId: reportId,
          action: ActivityAction.REPORT_UPDATED,
          actorType: ActivityActorType.ADMIN,
          actorUserId: user.id,
        }),
      });

      return updated;
    });

    return apiSuccess(report, "Report updated successfully", 200);
  } catch (error) {
    console.error("[PATCH /api/admin/projects/:id/reports/:reportId]", error);
    return apiError("Failed to update report", 500);
  }
}

/**
 * @summary: Delete a report by ID.
 * @param: id - The ID of the project
 * @param: reportId - The ID of the report
 * @returns: The deleted report data or an error message
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, reportId } = await params;

    const existing = await prisma.weeklyReport.findFirst({
      where: { id: reportId, projectId },
      select: { id: true },
    });
    if (!existing) return apiError("Report not found", 404);

    await prisma.weeklyReport.delete({ where: { id: reportId } });

    return apiSuccess(null, "Report deleted successfully", 200);
  } catch (error) {
    console.error("[DELETE /api/admin/projects/:id/reports/:reportId]", error);
    return apiError("Failed to delete report", 500);
  }
}
