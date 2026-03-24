import prisma from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api";
import { parseQueryParams } from "@/lib/parseQueryParams";
import { publicProjectQuerySchema } from "@/validations/projects.validation";
import { Prisma } from "@/app/generated/prisma/client";

/**
 * @summary: Get all projects (for guests)
 * @param: page - The page number
 * @param: limit - The number of projects per page
 * @param: featured - Whether to get featured projects
 * @param: category - The category of projects
 * @param: status - The status of projects
 * @param: type - The type of projects
 * @returns: The data and pagination info or an error message
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const parsed = parseQueryParams(publicProjectQuerySchema, searchParams);
    if (!parsed.success) return apiError(parsed.error, 400);

    const { page, limit, featured, category, status, type } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      ...(featured !== undefined && { isFeatured: featured }),
      ...(category && { category }),
      ...(status && { status }),
      ...(type && { type }),
    };

    const [total, projects] = await prisma.$transaction([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          thumbnailUrl: true,
          featuredImageUrl: true,
          category: true,
          techStack: true,
          status: true,
          liveUrl: true,
          repoUrl: true,
          isFeatured: true,
          displayOrder: true,
          year: true,
          galleryImages: true,
          type: true,
          testimonials: {
            where: { isVisible: true },
            orderBy: { displayOrder: "asc" as const },
            select: {
              id: true,
              clientName: true,
              clientTitle: true,
              clientCompany: true,
              clientAvatarUrl: true,
              content: true,
              rating: true,
              isFeatured: true,
            },
          },
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
    console.error("[GET /api/projects]", error);
    return apiError("Failed to fetch projects", 500);
  }
}
