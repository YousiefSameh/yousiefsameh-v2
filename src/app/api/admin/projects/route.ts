import prisma from "@/lib/prisma";
import { Prisma, Project } from "@/app/generated/prisma/client";
import { requireAdmin } from "@/lib/requireAdmin";
import { projectBaseSchema } from "@/features/admin/projects/validations/projects.validation";
import { APIResult } from "@/lib/types";
import { apiSuccess, apiError } from "@/lib/api";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { parseQueryParams } from "@/lib/parseQueryParams";
import { projectQuerySchema } from "@/features/admin/projects/validations/projects.validation";

/**
 * @summary Get all projects (for admin)
 * @param page - The page number
 * @param limit - The number of projects per page
 * @param featured - Whether to get featured projects
 * @param category - The category of projects
 * @param status - The status of projects
 * @param type - The type of projects
 * @returns The data and pagination info or an error message
 */
export async function GET(request: Request): Promise<APIResult<Project[]>> {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);

    const parsed = parseQueryParams(projectQuerySchema, searchParams);
    if (!parsed.success) return apiError(parsed.error, 400);

    const { page, limit, featured, category, status, type, clientId, search } =
      parsed.data;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { shortDescription: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(featured !== undefined && { isFeatured: featured }),
      ...(category && { category }),
      ...(status && { status }),
      ...(type && { type }),
      ...(clientId && { clientId }),
    };

    const [total, projects] = await prisma.$transaction([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              company: true,
              avatarUrl: true,
            },
          },
          files: { orderBy: { createdAt: "asc" } },
          tasks: { orderBy: { displayOrder: "asc" } },
          weeklyReports: { orderBy: { createdAt: "desc" } },
          testimonials: { orderBy: { displayOrder: "asc" } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return apiSuccess(projects, "Projects fetched successfully", 200, {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("[GET /api/admin/projects]", JSON.stringify(error, null, 2));
    return apiError("Failed to fetch projects", 500);
  }
}

/**
 * @summary Create a new project
 * @param request - the project fields
 * @returns The created project data or an error message
 */
export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();

    const validation = projectBaseSchema.safeParse(body);
    if (!validation.success) {
      return apiError(
        validation.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(", "),
        400,
      );
    }

    const projectData = validation.data;

    const project = await prisma.project.create({
      data: projectData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            avatarUrl: true,
          },
        },
        files: true,
        tasks: true,
        weeklyReports: true,
        testimonials: true,
      },
    });

    return apiSuccess(project, "Project Created Successfully", 201);
  } catch (error: unknown) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return apiError("Slug already exists", 409);
    }
    console.error("[POST /api/admin/projects]", error);
    return apiError("Failed to create project", 500);
  }
}
