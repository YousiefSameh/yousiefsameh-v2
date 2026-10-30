import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createBlogPost,
  deleteBlogPost,
  getAdminBlogPost,
  getAdminBlogPosts,
  updateBlogPost,
  GetBlogPostsParams,
  BlogPostResponse,
} from "../api";
import {
  BlogPostFormValues,
  BlogPostUpdateValues,
} from "../validations/blogs.validation";

export const blogKeys = {
  all: ["admin", "blogs"] as const,
  lists: () => [...blogKeys.all, "list"] as const,
  list: (params?: GetBlogPostsParams) =>
    [...blogKeys.lists(), params] as const,
  details: () => [...blogKeys.all, "detail"] as const,
  detail: (blogId: string) => [...blogKeys.details(), blogId] as const,
};

/**
 * Fetch paginated + filtered list of blog posts.
 * Keeps previous data while a new page or filter loads.
 */
export function useAdminBlogPosts(params?: GetBlogPostsParams) {
  return useQuery({
    queryKey: blogKeys.list(params),
    queryFn: () => getAdminBlogPosts(params),
    placeholderData: keepPreviousData,
  });
}

/**
 * Fetch a single blog post by ID.
 * Used on detail/edit pages to populate rich text and post metadata.
 */
export function useAdminBlogPost(blogId: string) {
  return useQuery({
    queryKey: blogKeys.detail(blogId),
    queryFn: () => getAdminBlogPost(blogId),
    enabled: blogId.length > 0,
  });
}

/**
 * Create a new blog post.
 * Invalidates post lists so the new post appears immediately.
 */
export function useCreateBlogPost() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: BlogPostFormValues) => createBlogPost(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
}

/**
 * Update an existing blog post.
 * Synchronizes the specific detail cache entry and invalidates list caches.
 */
export function useUpdateBlogPost(blogId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: BlogPostUpdateValues) =>
      updateBlogPost(blogId, payload),
    onSuccess: (response) => {
      qc.setQueryData<BlogPostResponse>(
        blogKeys.detail(blogId),
        response
      );
      qc.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
}

/**
 * Delete a blog post.
 * Purges the post from detail cache and invalidates post lists.
 */
export function useDeleteBlogPost() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (blogId: string) => deleteBlogPost(blogId),
    onSuccess: (_data, blogId) => {
      qc.removeQueries({
        queryKey: blogKeys.detail(blogId),
      });
      qc.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
}