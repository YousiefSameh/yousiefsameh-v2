"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { Edit, ExternalLink } from "lucide-react";
import { useDeleteBlogPost } from "@/features/admin/blog/hooks";
import { toast } from "sonner";
import { DeletePostModal } from "./DeletePostModal";

interface BlogRowActionsProps {
  blogId: string;
  slug: string;
}

export function BlogRowActions({ blogId, slug }: BlogRowActionsProps) {
  const router = useRouter();
  const { mutate: deleteBlog } = useDeleteBlogPost();

  function handleDelete() {
    deleteBlog(blogId, {
      onSuccess: () => toast.success("Blog post deleted successfully"),
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <div className="flex justify-end">
      <Button
        variant={"ghost"}
        size={"icon-lg"}
        onClick={() => window.open(`/blog/${slug}`, "_blank")}
        className="cursor-pointer"
      >
        <ExternalLink className="h-4 w-4" />
      </Button>
      <Button
        variant={"ghost"}
        size={"icon-lg"}
        onClick={() => router.push(`/admin/blogs/${blogId}`)}
        className="cursor-pointer"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <DeletePostModal onConfirm={handleDelete} />
    </div>
  );
}
