import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  ProjectCategory,
  ProjectStatus,
  ProjectType,
} from "@/app/generated/prisma/client";

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

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit") ?? 9)),
    );
    const skip = (page - 1) * limit;

    const featured = searchParams.get("featured");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where = {
      ...(featured === "true" && { isFeatured: true }),
      ...(category && { category: category as ProjectCategory }),
      ...(status && { status: status as ProjectStatus }),
      ...(type && { type: type as ProjectType }),
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

    return NextResponse.json({
      success: true,
      data: projects,
      message: "Projects fetched successfully",
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("[GET /api/projects]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}
