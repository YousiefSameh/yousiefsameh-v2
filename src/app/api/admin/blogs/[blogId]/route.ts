import prisma from "@/lib/prisma";
import { BlogPost, Prisma } from "@/app/generated/prisma/client";
import { requireAdmin } from "@/lib/requireAdmin";
import { blogPostUpdateSchema } from "@/features/admin/blog/validations/blogs.validation";
import { APIResult } from "@/lib/types";
import { apiSuccess, apiError } from "@/lib/api";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

interface RouteParams {
  params: Promise<{ blogId: string }>;
}

/**
 * GET /api/admin/blogs/[blogId]
 * -----------------------------
 * Retrieves a single blog post by its unique identifier (UUID).
 *
 * Route Parameters:
 * @param {string} blogId - UUID of the target blog post.
 *
 * @returns {Promise<APIResult<BlogPost>>} The requested blog post entity.
 */

export async function GET(
  _request: Request,
  { params }: RouteParams
): Promise<APIResult<BlogPost>> {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", 401);
    }

    const { blogId } = await params;

    const blog = await prisma.blogPost.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      return apiError("Blog post not found", 404);
    }

    return apiSuccess(blog, "Blog fetched successfully", 200);
  } catch (error: unknown) {
    console.error(`[GET /api/admin/blogs/[blogId]]`, error);
    return apiError("Failed to fetch blog post", 500);
  }
}

/**
 * PATCH /api/admin/blogs/[blogId]
 * ------------------------------
 * Updates an existing blog post by its unique identifier (UUID).
 *
 * Route Parameters:
 * @param {string} blogId - UUID of the target blog post.
 *
 * Request Body Payload (validated via `blogPostUpdateSchema` - all fields optional):
 * @param {string} [title]              - Updated display title.
 * @param {string} [slug]               - Updated URL-safe unique slug.
 * @param {string} [excerpt]            - Updated teaser summary.
 * @param {any} [content]               - Updated JSON rich-text payload.
 * @param {BlogPostCategory} [category] - Updated post category enum.
 * @param {string[]} [tags]             - Updated array of tag strings.
 * @param {number} [readingTimeMinutes] - Updated estimated reading duration.
 * @param {boolean} [isPublished]       - Updated publishing status.
 * @param {Date} [publishedAt]          - Updated timestamp for publication.
 * @param {string} [featuredImageUrl]   - Updated cover image URL.
 *
 * @returns {Promise<APIResult<BlogPost>>} Updated blog post database entity.
 */
export async function PATCH(
  request: Request,
  { params }: RouteParams
): Promise<APIResult<BlogPost>> {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", 401);
    }

    const { blogId } = await params;
    const existingBlog = await prisma.blogPost.findUnique({
      where: { id: blogId },
    });

    if (!existingBlog) {
      return apiError("Blog post not found", 404);
    }

    const body = await request.json();
    const validation = blogPostUpdateSchema.safeParse(body);

    if (!validation.success) {
      return apiError(
        validation.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(", "),
        400
      );
    }

    const updateData = validation.data;

    const { content, ...restUpdateData } = updateData;

    const updatedBlog = await prisma.blogPost.update({
      where: { id: blogId },
      data: {
        ...restUpdateData,
        ...(content !== undefined && {
          content: content as Prisma.InputJsonValue,
        }),
        updatedAt: new Date(),
      },
    });

    return apiSuccess(updatedBlog, "Blog updated successfully", 200);
  } catch (error: unknown) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return apiError("Slug already exists", 409);
    }

    console.error(`[PATCH /api/admin/blogs/[blogId]]`, error);
    return apiError("Failed to update blog post", 500);
  }
}

/**
 * DELETE /api/admin/blogs/[blogId]
 * -------------------------------
 * Permanently removes a blog post record from the database.
 *
 * Route Parameters:
 * @param {string} blogId - UUID of the blog post to delete.
 *
 * @returns {Promise<APIResult<BlogPost>>} Deleted blog post entity confirmation.
 */
export async function DELETE(
  _request: Request,
  { params }: RouteParams
): Promise<APIResult<BlogPost>> {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", 401);
    }

    const { blogId } = await params;

    const existingBlog = await prisma.blogPost.findUnique({
      where: { id: blogId },
    });

    if (!existingBlog) {
      return apiError("Blog post not found", 404);
    }

    const deletedBlog = await prisma.blogPost.delete({
      where: { id: blogId },
    });

    return apiSuccess(deletedBlog, "Blog deleted successfully", 200);
  } catch (error: unknown) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return apiError("Blog post not found", 404);
    }

    console.error(`[DELETE /api/admin/blogs/[blogId]]`, error);
    return apiError("Failed to delete blog post", 500);
  }
}