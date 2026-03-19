import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ProjectCategory, ProjectStatus, ProjectType } from "@/app/generated/prisma/client";
import { requireAdmin } from "@/lib/requireAdmin";

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
export async function GET(request: Request) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 10)));
    const skip = (page - 1) * limit;

    const featured = searchParams.get("featured");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const clientId = searchParams.get("clientId");

    const where = {
      ...(featured === "true" && { isFeatured: true }),
      ...(category && { category: category as ProjectCategory }),
      ...(status && { status: status as ProjectStatus }),
      ...(type && { type: type as ProjectType }),
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
            select: { id: true, name: true, email: true, company: true, avatarUrl: true },
          },
          files: { orderBy: { createdAt: "asc" } },
          tasks: { orderBy: { displayOrder: "asc" } },
          weeklyReports: { orderBy: { createdAt: "desc" } },
          testimonials: { orderBy: { displayOrder: "asc" } },
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
    console.error("[GET /api/admin/projects]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
      { status: 500 },
    );
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
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      shortDescription,
      fullDescription,
      thumbnailUrl,
      featuredImageUrl,
      category,
      techStack,
      status,
      liveUrl,
      repoUrl,
      isFeatured,
      displayOrder,
      year,
      galleryImages,
      clientId,
      type,
    } = body;

    if (!title || !slug || !shortDescription || !category) {
      return NextResponse.json(
        { success: false, error: "title, slug, shortDescription and category are required" },
        { status: 400 },
      );
    }

    const project = await prisma.project.create({
      data: {
        title,
        slug,
        shortDescription,
        fullDescription,
        thumbnailUrl,
        featuredImageUrl,
        category,
        techStack: techStack ?? [],
        status,
        liveUrl,
        repoUrl,
        isFeatured,
        displayOrder,
        year,
        galleryImages: galleryImages ?? [],
        clientId,
        type,
      },
      include: {
        client: {
          select: { id: true, name: true, email: true, company: true, avatarUrl: true },
        },
        files: true,
        tasks: true,
        weeklyReports: true,
        testimonials: true,
      },
    });

    return NextResponse.json({ success: true, message: "Project Created Successfully", data: project }, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2002") {
      return NextResponse.json({ success: false, error: "Slug already exists" }, { status: 409 });
    }
    console.error("[POST /api/admin/projects]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 },
    );
  }
}
