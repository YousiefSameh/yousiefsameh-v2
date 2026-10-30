import axios from "axios";
import { APIResponse } from "@/lib/types";
import axiosErrorHandler from "@/lib/axiosErrorHandler";
import { BlogPost } from "@/app/generated/prisma/client";
import {
  BlogPostFormValues,
  BlogPostQuery,
  BlogPostUpdateValues,
} from "../validations/blogs.validation";

const api = axios.create({
  baseURL: "/api/admin/blogs",
  headers: { "Content-Type": "application/json" },
});

export type BlogPostResponse = APIResponse<BlogPost>;
export type BlogPostsResponse = APIResponse<BlogPost[]>;

export type GetBlogPostsParams = Partial<BlogPostQuery>;

/**
 * @summary Get paginated list of blog posts with optional filters
 * @param params - Optional filters: page, limit, category, tag, isPublished, search
 */
export async function getAdminBlogPosts(
  params?: GetBlogPostsParams
): Promise<BlogPostsResponse> {
  try {
    const { data } = await api.get<BlogPostsResponse>("", { params });
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Get a single blog post by ID
 * @param blogId - The blog post UUID
 */
export async function getAdminBlogPost(
  blogId: string
): Promise<BlogPostResponse> {
  try {
    const { data } = await api.get<BlogPostResponse>(`/${blogId}`);
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Create a new blog post
 * @param payload - Blog post form values
 */
export async function createBlogPost(
  payload: BlogPostFormValues
): Promise<BlogPostResponse> {
  try {
    const { data } = await api.post<BlogPostResponse>("", payload);
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Update an existing blog post
 * @param blogId - The blog post UUID
 * @param payload - Partial blog post fields
 */
export async function updateBlogPost(
  blogId: string,
  payload: BlogPostUpdateValues
): Promise<BlogPostResponse> {
  try {
    const { data } = await api.patch<BlogPostResponse>(
      `/${blogId}`,
      payload
    );
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Delete a blog post by ID
 * @param blogId - The blog post UUID
 */
export async function deleteBlogPost(blogId: string): Promise<void> {
  try {
    await api.delete(`/${blogId}`);
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}