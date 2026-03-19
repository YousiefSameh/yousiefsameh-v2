import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

/**
 * @summary Get a project by ID
 * @param id - The ID of the project
 * @returns The project data or an error message
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;

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
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, message: "Project fetched successfully", data: project });
  } catch (error) {
    console.error("[GET /api/projects/:id]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch project" },
      { status: 500 },
    );
  }
}
