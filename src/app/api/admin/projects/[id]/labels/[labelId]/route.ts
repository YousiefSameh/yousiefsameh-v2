import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import { labelBaseSchema } from "@/validations/labels.validation";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

type Params = { params: Promise<{ id: string; labelId: string }> };

/**
 * @summary Update a label by ID
 * @param id - The ID of the project
 * @param labelId - The ID of the label
 * @param request - The updated fields (name, color)
 * @returns The updated label data or an error message
 */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, labelId } = await params;
    const body = await request.json();

    const validation = labelBaseSchema.partial().safeParse(body);
    if (!validation.success) {
      return apiError(
        validation.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(", "),
        400,
      );
    }

    // Verify the label belongs to this project before updating
    const existing = await prisma.taskLabel.findFirst({
      where: { id: labelId, projectId },
      select: { id: true },
    });
    if (!existing) return apiError("Label not found", 404);

    const label = await prisma.taskLabel.update({
      where: { id: labelId },
      data: validation.data,
    });

    return apiSuccess(label, "Label updated successfully", 200);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") return apiError("Label not found", 404);
      if (error.code === "P2002") {
        return apiError("A label with this name already exists", 409);
      }
    }
    console.error("[PATCH /api/admin/projects/:id/labels/:labelId]", error);
    return apiError("Failed to update label", 500);
  }
}

/**
 * @summary Delete a label by ID
 * @param id - The ID of the project
 * @param labelId - The ID of the label
 * @returns A success status or an error message
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const { id: projectId, labelId } = await params;

    // Verify the label belongs to this project before deleting
    const existing = await prisma.taskLabel.findFirst({
      where: { id: labelId, projectId },
      select: { id: true },
    });
    if (!existing) return apiError("Label not found", 404);

    await prisma.taskLabel.delete({ where: { id: labelId } });

    return apiSuccess(null, "Label deleted successfully", 200);
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return apiError("Label not found", 404);
    }
    console.error("[DELETE /api/admin/projects/:id/labels/:labelId]", error);
    return apiError("Failed to delete label", 500);
  }
}