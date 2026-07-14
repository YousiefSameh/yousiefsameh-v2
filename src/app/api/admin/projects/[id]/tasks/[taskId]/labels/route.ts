import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import { labelBaseSchema } from "@/features/admin/tasks/validations";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

type Params = { params: Promise<{ id: string }> };

/**
 * @summary Get all labels for a project
 * @param id - The ID of the project
 * @returns Labels ordered by createdAt asc or an error message
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId } = await params;

    const labels = await prisma.taskLabel.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
    });

    return apiSuccess(labels, "Labels fetched successfully", 200);
  } catch (error) {
    console.error("[GET /api/admin/projects/:id/labels]", error);
    return apiError("Failed to fetch labels", 500);
  }
}

/**
 * @summary Create a new label for a project
 * @param id      - The ID of the project
 * @param request - { name, color? }
 * @returns The created label or an error message
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId } = await params;
    const body = await request.json();

    const validation = labelBaseSchema.safeParse(body);
    if (!validation.success) {
      return apiError(
        validation.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(", "),
        400,
      );
    }

    const label = await prisma.taskLabel.create({
      data: { projectId, ...validation.data },
    });

    return apiSuccess(label, "Label created successfully", 201);
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return apiError("A label with this name already exists", 409);
    }
    console.error("[POST /api/admin/projects/:id/labels]", error);
    return apiError("Failed to create label", 500);
  }
}
