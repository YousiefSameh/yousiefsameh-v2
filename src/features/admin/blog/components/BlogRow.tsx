"use client";

import { BlogPost } from "@/app/generated/prisma/browser";
import { Badge } from "@/components/atoms/badge";
import { BlogRowActions } from "./BlogRowActions";
import Link from "next/link";

interface BlogRowProps {
  blog: BlogPost;
}

export function BlogRow({ blog }: BlogRowProps) {
  return (
    <tr className="border-b border-border last:border-0 transition-colors hover:bg-muted/40">
      <td className="p-4">
        <p className="font-medium">{blog.title}</p>
        <Link href={`/blog/${blog.slug}`} className="text-sm text-muted-foreground line-clamp-1 w-fit hover:text-primary">
          /{blog.slug}
        </Link>
      </td>
      <td className="p-4">
        <Badge variant="secondary" className="capitalize">
          {blog.category.replace(/_/g, " ")
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")}
        </Badge>
      </td>
      <td className="p-4">
        <Badge variant={blog.isPublished ? "default" : "outline"}>
          {blog.isPublished ? "Published" : "Draft"}
        </Badge>
      </td>
      <td className="p-4 text-sm text-muted-foreground">
        {new Date(blog.updatedAt || "").toLocaleDateString()}
      </td>
      <td className="p-4">
        <BlogRowActions slug={blog.slug || ""} blogId={blog.id} />
      </td>
    </tr>
  );
}