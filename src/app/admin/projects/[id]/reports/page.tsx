"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { ReportStatus } from "@/app/generated/prisma/enums";
import { useAdminReports } from "@/features/admin/reports/hooks";
import { useDebounce } from "@/hooks/useDebounce";
import { ReportsTable } from "@/features/admin/reports/components/ReportsTable";
import { CreateReportSheet } from "@/features/admin/reports/components/CreateReportSheet";
import { Pagination } from "@/components/molecules/Pagination";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";

export default function ProjectReportsPage() {
  const { id: projectId } = useParams<{ id: string }>();

  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ReportStatus | "ALL">("ALL");

  const debouncedSearch = useDebounce(search, 400);

  const { data, isPending, isError } = useAdminReports(projectId, {
    page,
    limit:  10,
    search: debouncedSearch || undefined,
    status: status === "ALL" ? undefined : status,
  });

  const reports    = data?.data ?? [];
  const pagination = data?.pagination;
  const hasFilters = search || status !== "ALL";

  function handleFilterChange(fn: () => void) {
    fn();
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setStatus("ALL");
    setPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Weekly Reports
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create and publish weekly progress updates for your client.
          </p>
        </div>
        <CreateReportSheet projectId={projectId} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports…"
            value={search}
            onChange={(e) =>
              handleFilterChange(() => setSearch(e.target.value))
            }
            className="pl-9"
          />
        </div>

        <Select
          value={status}
          onValueChange={(v) =>
            handleFilterChange(() => setStatus(v as ReportStatus | "ALL"))
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="destructive"
            size="default"
            onClick={resetFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      {isError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load reports. Please try refreshing the page.
        </div>
      )}

      <ReportsTable
        reports={reports}
        projectId={projectId}
        isPending={isPending}
      />

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          isPending={isPending}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}