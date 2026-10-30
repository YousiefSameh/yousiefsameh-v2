"use client";

import { use } from "react";
import { type JSONContent } from "@tiptap/core";
import { BlogPostForm } from "@/features/admin/blog/components/BlogPostForm";
import { useAdminBlogPost } from "@/features/admin/blog/hooks";
import { Skeleton } from "@/components/atoms/skeleton";

interface EditBlogPageProps {
  params: Promise<{ blogId: string }>;
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
  const { blogId } = use(params);

  const { data, isPending, isError } = useAdminBlogPost(blogId);

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-100 rounded-xl lg:col-span-2" />
          <Skeleton className="h-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Blog post not found or failed to load.
      </div>
    );
  }

  // Format blog data to match BlogData type strictly
  const blog = {
    ...data.data,
    content: (data.data.content as JSONContent | null) ?? null,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{blog.title}</h1>
          <p className="mt-1 text-muted-foreground">Edit your blog post</p>
        </div>
      </div>

      <BlogPostForm blog={blog} />
    </div>
  );
}