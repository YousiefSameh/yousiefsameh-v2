"use client";

import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type JSONContent } from "@tiptap/core";
import { Button } from "@/components/atoms/button";
import { Form } from "@/components/atoms/form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  blogPostBaseSchema,
  BlogPostFormValues,
} from "@/features/admin/blog/validations/blogs.validation";
import {
  useCreateBlogPost,
  useUpdateBlogPost,
} from "@/features/admin/blog/hooks";
import { BlogBasicInfoCard } from "./BlogBasicInfoCard";
import { BlogMetadataCard } from "./BlogMetadataCard";
import { BlogEditorCard } from "./BlogEditorCard";
import { BlogPostCategory } from "@/app/generated/prisma/enums";

export type BlogData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: JSONContent | null;
  featuredImageUrl: string | null;
  category: BlogPostCategory;
  tags: string[];
  readingTimeMinutes: number | null;
  isPublished: boolean | null;
};

interface BlogPostFormProps {
  blog?: BlogData;
}

export function BlogPostForm({ blog }: BlogPostFormProps) {
  const router = useRouter();
  const { mutate: createBlog, isPending: isCreating } = useCreateBlogPost();
  const { mutate: updateBlog, isPending: isUpdating } = useUpdateBlogPost(
    blog?.id ?? ""
  );

  const isPending = isCreating || isUpdating;

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostBaseSchema) as Resolver<BlogPostFormValues>,
    defaultValues: {
      title: blog?.title ?? "",
      slug: blog?.slug ?? "",
      excerpt: blog?.excerpt ?? "",
      content: blog?.content ?? {},
      featuredImageUrl: blog?.featuredImageUrl ?? "",
      category: blog?.category ?? undefined,
      tags: blog?.tags ?? [],
      readingTimeMinutes: blog?.readingTimeMinutes ?? 5,
      isPublished: blog?.isPublished ?? false,
    },
  });

  const onSubmit: SubmitHandler<BlogPostFormValues> = (data) => {
    if (blog) {
      updateBlog(data, {
        onSuccess: () => {
          toast.success("Blog updated successfully");
          router.push("/admin/blogs");
        },
        onError: (err) => toast.error(err.message),
      });
    } else {
      createBlog(data, {
        onSuccess: () => {
          toast.success("Blog created successfully");
          router.push("/admin/blogs");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <BlogBasicInfoCard form={form} />
            <BlogEditorCard form={form} />
          </div>

          <div className="space-y-6">
            <BlogMetadataCard form={form} />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : blog ? (
              "Update Blog"
            ) : (
              "Create Blog"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}