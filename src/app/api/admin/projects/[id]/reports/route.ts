import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import { parseQueryParams } from "@/lib/parseQueryParams";
import {
  reportBaseSchema,
  reportQuerySchema,
} from "@/features/admin/reports/validations";
import { Prisma } from "@/app/generated/prisma/client";
import {
  ActivityAction,
  ActivityEntityType,
  ActivityActorType,
} from "@/app/generated/prisma/enums";
import { buildActivityCreateData } from "@/lib/activity/log";

type Params = { params: Promise<{ id: string }> };

/** Fields included on every report response — counts for list view performance */
const reportInclude = {
  _count: {
    select: {
      comments: true,
      attachments: true,
    },
  },
} satisfies Prisma.WeeklyReportInclude;

/**
 * @summary Get all reports for a project, paginated and filterable.
 * @query status - Filter by DRAFT | PUBLISHED
 * @query search - Case-insensitive title search
 * @query page   - Page number (default 1)
 * @query limit  - Items per page (default 20)
 */
export async function GET(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId } = await params;

    const { searchParams } = new URL(request.url);
    const parsed = parseQueryParams(reportQuerySchema, searchParams);
    if (!parsed.success) return apiError(parsed.error, 400);

    const { status, search, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Prisma.WeeklyReportWhereInput = {
      projectId,
      ...(status && { status }),
      ...(search && {
        title: { contains: search, mode: "insensitive" },
      }),
    };

    const [total, reports] = await prisma.$transaction([
      prisma.weeklyReport.count({ where }),
      prisma.weeklyReport.findMany({
        where,
        include: reportInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return apiSuccess(reports, "Reports fetched successfully", 200, {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("[GET /api/admin/projects/:id/reports]", error);
    return apiError("Failed to fetch reports", 500);
  }
}

/**
 * @summary Create a new report for a project.
 * Emits a REPORT_CREATED activity log entry in the same transaction.
 * @param request - { title, content?, status? }
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId } = await params;
    const body = await request.json();

    const validation = reportBaseSchema.safeParse(body);
    if (!validation.success) {
      return apiError(
        validation.error.issues.map((i) => i.message).join(", "),
        400,
      );
    }

    // Verify the project exists before creating a report for it
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project) return apiError("Project not found", 404);

    const report = await prisma.$transaction(async (tx) => {
      const created = await tx.weeklyReport.create({
        data: { projectId, ...validation.data },
        include: reportInclude,
      });

      await tx.activityLog.create({
        data: buildActivityCreateData({
          projectId,
          entityType: ActivityEntityType.REPORT,
          entityId: created.id,
          action: ActivityAction.REPORT_CREATED,
          actorType: ActivityActorType.ADMIN,
          actorUserId: user.id,
        }),
      });

      return created;
    });

    return apiSuccess(report, "Report created successfully", 201);
  } catch (error) {
    console.error("[POST /api/admin/projects/:id/reports]", error);
    return apiError("Failed to create report", 500);
  }
}
