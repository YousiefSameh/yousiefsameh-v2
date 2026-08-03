import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import { Prisma } from "@/app/generated/prisma/client";
import { ActivityAction, ActivityEntityType, ActivityActorType, ReportStatus } from "@/app/generated/prisma/enums";
import { buildActivityCreateData } from "@/lib/activity/log";

type Params = { params: Promise<{ id: string; reportId: string }> };

const reportInclude = {
  _count: {
    select: {
      comments:    true,
      attachments: true,
    },
  },
} satisfies Prisma.WeeklyReportInclude;

/**
 * @summary Toggle a report between DRAFT and PUBLISHED.
 *
 * POST /api/admin/projects/[id]/reports/[reportId]/publish
 *
 * - DRAFT    → PUBLISHED  (publishes the report, emits REPORT_PUBLISHED)
 * - PUBLISHED → DRAFT     (unpublishes, emits REPORT_UPDATED)
 *
 * Using POST (not PATCH) because this is a deliberate state-machine
 * transition, not a generic field update. The client sends no body.
 * @param: id - The ID of the project
 * @param: reportId - The ID of the report
 * @returns: The published/unpublished report or an error message
 */
export async function POST(_req: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, reportId } = await params;

    const existing = await prisma.weeklyReport.findFirst({
      where:  { id: reportId, projectId },
      select: { id: true, status: true },
    });
    if (!existing) return apiError("Report not found", 404);

    const nextStatus =
      existing.status === ReportStatus.PUBLISHED
        ? ReportStatus.DRAFT
        : ReportStatus.PUBLISHED;

    // Determine which activity action to emit
    const action =
      nextStatus === ReportStatus.PUBLISHED
        ? ActivityAction.REPORT_PUBLISHED
        : ActivityAction.REPORT_UPDATED;

    const report = await prisma.$transaction(async (tx) => {
      const updated = await tx.weeklyReport.update({
        where:   { id: reportId },
        data:    { status: nextStatus, updatedAt: new Date() },
        include: reportInclude,
      });

      await tx.activityLog.create({
        data: buildActivityCreateData({
          projectId,
          entityType:  ActivityEntityType.REPORT,
          entityId:    reportId,
          action,
          actorType:   ActivityActorType.ADMIN,
          actorUserId: user.id,
          diff: {
            status: { from: existing.status, to: nextStatus },
          },
        }),
      });

      return updated;
    });

    const message =
      nextStatus === ReportStatus.PUBLISHED
        ? "Report published successfully"
        : "Report unpublished successfully";

    return apiSuccess(report, message, 200);
  } catch (error) {
    console.error(
      "[POST /api/admin/projects/:id/reports/:reportId/publish]",
      error,
    );
    return apiError("Failed to toggle report publish status", 500);
  }
}