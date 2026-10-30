"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { Plus } from "lucide-react";
import { useAdminBlogPosts } from "@/features/admin/blog/hooks";
import { BlogsTable } from "@/features/admin/blog/components/BlogsTable";
import { Pagination } from "@/components/molecules/Pagination";

export default function BlogsPage() {
  const [page, setPage] = useState(1);
  const { data, isPending } = useAdminBlogPosts({ page, limit: 10 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blogs</h1>
          <p className="text-muted-foreground mt-1">
            Manage your blogs posts
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/blogs/new">
            <Plus className="mr-2 h-4 w-4" />
            Add blog
          </Link>
        </Button>
      </div>

      <BlogsTable
        blogs={data?.data ?? []}
        isPending={isPending}
      />

      {data?.pagination && (
        <Pagination
          page={data.pagination.page ?? 1}
          totalPages={data.pagination.totalPages ?? 1}
          total={data.pagination.total ?? 0}
          limit={data.pagination.limit ?? 10}
          hasNextPage={data.pagination.hasNextPage}
          hasPrevPage={data.pagination.hasPrevPage}
          isPending={isPending}
          onPageChange={(page) => setPage(page)}
        />
      )}
    </div>
  );
}
