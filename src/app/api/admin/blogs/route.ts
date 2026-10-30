import prisma from "@/lib/prisma";
import { BlogPost, Prisma } from "@/app/generated/prisma/client";
import { requireAdmin } from "@/lib/requireAdmin";
import {
  blogPostBaseSchema,
  blogPostQuerySchema,
} from "@/features/admin/blog/validations/blogs.validation";
import { APIResult } from "@/lib/types";
import { apiSuccess, apiError } from "@/lib/api";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { parseQueryParams } from "@/lib/parseQueryParams";

/**
 * GET /api/admin/blogs
 * --------------------
 * Fetches a paginated, filterable list of blog posts for administrative management.
 *
 * Query Parameters (parsed via `blogPostQuerySchema`):
 * @param {number} [page=1]        - Page offset indicator (1-indexed).
 * @param {number} [limit=10]      - Maximum records per page (max 50).
 * @param {string} [category]      - Filter posts matching a specific BlogPostCategory enum.
 * @param {string} [tag]           - Filter posts containing a specific tag in the `tags` array.
 * @param {boolean} [isPublished]  - Filter posts by published/draft visibility status.
 * @param {string} [search]        - Case-insensitive search string evaluated against title, excerpt, and slug.
 *
 * @returns {Promise<APIResult<BlogPost[]>>} Paginated result payload containing blog post models and metadata.
 */

export async function GET(request: Request): Promise<APIResult<BlogPost[]>> {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);

    const parsed = parseQueryParams(blogPostQuerySchema, searchParams);
    if (!parsed.success) return apiError(parsed.error, 400);

    const { page, limit, category, tag, isPublished, search } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Prisma.BlogPostWhereInput = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { excerpt: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(isPublished !== undefined && { isPublished }),
      ...(category && { category }),
      ...(tag && { tags: { has: tag } }),
    };

    const [total, blogs] = await prisma.$transaction([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return apiSuccess(blogs, "Blogs fetched successfully", 200, {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("[GET /api/admin/blogs]", JSON.stringify(error, null, 2));
    return apiError("Failed to fetch blogs", 500);
  }
}

/**
 * POST /api/admin/blogs
 * --------------------
 * Creates a new blog post entry in the database.
 *
 * Request Body Payload (validated via `blogPostBaseSchema`):
 * @param {string} title                - Display title of the blog post.
 * @param {string} slug                 - URL-safe unique identifier.
 * @param {string} excerpt              - Brief summary/teaser text.
 * @param {any} content                 - Structured JSON document representing rich body content.
 * @param {BlogPostCategory} category   - Category enum assignment.
 * @param {string[]} [tags]             - List of tag strings (defaults to empty array).
 * @param {number} [readingTimeMinutes] - Estimated reading duration (defaults to 5).
 * @param {boolean} [isPublished]       - Immediate publication flag (defaults to false).
 * @param {Date} [publishedAt]          - Optional timestamp for scheduled/retroactive publication.
 * @param {string} [featuredImageUrl]   - Optional cover image URL.
 *
 * @returns {Promise<APIResult<BlogPost>>} Created blog post database entity.
 */
export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();

    const validation = blogPostBaseSchema.safeParse(body);
    if (!validation.success) {
      return apiError(
        validation.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(", "),
        400
      );
    }

    const blogData = validation.data;

    const blog = await prisma.blogPost.create({
      data: {
        ...blogData,
        content: blogData.content as Prisma.InputJsonValue,
      },
    });

    return apiSuccess(blog, "Blog Created Successfully", 201);
  } catch (error: unknown) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return apiError("Slug already exists", 409);
    }
    console.error("[POST /api/admin/blogs]", error);
    return apiError("Failed to create blog", 500);
  }
}