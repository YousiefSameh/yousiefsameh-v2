import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { requireAdmin } from "@/lib/requireAdmin";

type Params = { params: Promise<{ id: string }> };

const adminInclude = {
  client: {
    select: { id: true, name: true, email: true, company: true, avatarUrl: true },
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
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: adminInclude,
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Project fetched successfully", data: project });
  } catch (error) {
    console.error("[GET /api/admin/projects/:id]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch project" },
      { status: 500 },
    );
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
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const { ...projectFields } = body;

    const project = await prisma.project.update({
      where: { id },
      data: { ...projectFields, updatedAt: new Date() },
      include: adminInclude,
    });

    return NextResponse.json({ success: true, message: "Project updated successfully", data: project });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error?.code === "P2025") {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }
    if (error instanceof PrismaClientKnownRequestError && error?.code === "P2002") {
      return NextResponse.json({ success: false, error: "Slug already exists" }, { status: 409 });
    }
    console.error("[PATCH /api/admin/projects/:id]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update project" },
      { status: 500 },
    );
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
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Project deleted successfully" }, { status: 200 });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }
    console.error("[DELETE /api/admin/projects/:id]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
