import prisma from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api";

type Params = { params: { id: string } };

/**
 * @summary Get a project by ID
 * @param id - The ID of the project
 * @returns The project data or an error message
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = params;

    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        fullDescription: true,
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
          orderBy: { displayOrder: "asc" },
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
    });

    if (!project) {
      return apiError("Project not found", 404);
    }

    return apiSuccess(project, "Project fetched successfully", 200);
  } catch (error) {
    console.error("[GET /api/projects/:id]", error);
    return apiError("Failed to fetch project", 500);
  }
}
