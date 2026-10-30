"use client";

import { BlogPost } from "@/app/generated/prisma/browser";
import { Card, CardContent } from "@/components/atoms/card";
import { BlogRow } from "./BlogRow";
import { BlogRowSkeleton } from "./BlogRowSkeleton";

interface BlogsTableProps {
  blogs: BlogPost[];
  isPending: boolean;
}

export function BlogsTable({ blogs, isPending }: BlogsTableProps) {
  return (
    <Card className="py-0">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Post
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Category
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Last Updated
                </th>
                <th className="text-right p-4 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isPending
                ? Array.from({ length: 5 }).map((_, i) => (
                    <BlogRowSkeleton key={i} />
                  ))
                : blogs.map((blog) => <BlogRow key={blog.id} blog={blog} />)}
            </tbody>
          </table>

          {!isPending && blogs.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No blog posts found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
