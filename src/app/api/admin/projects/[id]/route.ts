import prisma from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import { projectBaseSchema } from "@/features/admin/projects/validations/projects.validation";

type Params = { params: Promise<{ id: string }> };

const adminInclude = {
  client: {
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      avatarUrl: true,
    },
  },
  files: { orderBy: { createdAt: "asc" as const } },
  tasks: { orderBy: { displayOrder: "asc" as const } },
  weeklyReports: { orderBy: { createdAt: "desc" as const } },
  testimonials: { orderBy: { displayOrder: "asc" as const } },
};

/**
 * @summary: Get a project by ID
 * @param: id - The ID of the project
 * @returns: The project data or an error message
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", 401);
    }

    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: adminInclude,
    });

    if (!project) {
      return apiError("Project not found", 404);
    }

    return apiSuccess(project, "Project fetched successfully", 200);
  } catch (error) {
    console.error("[GET /api/admin/projects/:id]", error);
    return apiError("Failed to fetch project", 500);
  }
}

/**
 * @summary: Update a project by ID
 * @param: id - The ID of the project
 * @param: request - the updated fileds
 * @returns: The updated project data or an error message
 */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", 401);
    }

    const { id } = await params;
    const body = await request.json();

    const validation = projectBaseSchema.partial().safeParse(body);
    if (!validation.success) return apiError("Invalid form data.", 400);

    const project = await prisma.project.update({
      where: { id },
      data: { ...validation.data, updatedAt: new Date() },
      include: adminInclude,
    });

    return apiSuccess(project, "Project updated successfully", 200);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error?.code === "P2025") {
        return apiError("Project not found", 404);
      }
      if (error?.code === "P2002") {
        return apiError("Slug already exists", 409);
      }
    }
    console.error("[PATCH /api/admin/projects/:id]", error);
    return apiError("Failed to update project", 500);
  }
}

/**
 * @summary: Delete a project by ID
 * @param: id - The ID of the project
 * @returns: A success status or error message
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", 401);
    }

    const { id } = await params;

    await prisma.project.delete({ where: { id } });

    return apiSuccess(null, "Project deleted successfully", 200);
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return apiError("Project not found", 404);
    }
    console.error("[DELETE /api/admin/projects/:id]", error);
    return apiError("Failed to delete project", 500);
  }
}
