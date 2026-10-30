import { BlogPostForm } from "@/features/admin/blog/components/BlogPostForm";

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Create Blog Post</h1>
            <p className="text-muted-foreground mt-1">
              Draft a new article for your blog.
            </p>
          </div>
        </div>
      </div>
      <BlogPostForm />
    </div>
  );
}