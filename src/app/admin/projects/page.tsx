"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { Plus, Search, X } from "lucide-react";
import { ProjectsTable } from "@/features/admin/projects/components";
import { ProjectsErrorAlert } from "@/components/molecules/projects/ProjectsErrorAlert";
import { useAdminProjects } from "@/features/admin/projects/hooks";
import { Pagination } from "@/components/molecules/Pagination";
import {
  ProjectCategory,
  ProjectStatus,
  ProjectType,
} from "@/app/generated/prisma/enums";
import { useDebounce } from "@/hooks/useDebounce";

const categoryLabels: Record<ProjectCategory, string> = {
  WEB_APP: "Web App",
  SAAS: "SaaS",
  MOBILE: "Mobile",
  LANDING_PAGE: "Landing Page",
  E_COMMERCE: "E-commerce",
  OTHER: "Other",
};

const statusLabels: Record<ProjectStatus, string> = {
  COMPLETED: "Completed",
  IN_PROGRESS: "In Progress",
  UNDER_DEVELOPMENT: "Under Development",
};

const typeLabels: Record<ProjectType, string> = {
  PORTFOLIO: "Portfolio",
  CLIENT: "Client",
};

export default function AdminProjectsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProjectCategory | "ALL">("ALL");
  const [status, setStatus] = useState<ProjectStatus | "ALL">("ALL");
  const [type, setType] = useState<ProjectType | "ALL">("ALL");
  const [featured, setFeatured] = useState<"ALL" | "true" | "false">("ALL");

  const debouncedSearch = useDebounce(search, 400);

  const { data, isPending, isError } = useAdminProjects({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    category: category === "ALL" ? undefined : category,
    status: status === "ALL" ? undefined : status,
    type: type === "ALL" ? undefined : type,
    featured: featured === "ALL" ? undefined : featured === "true",
  });

  const projects = data?.data ?? [];
  const pagination = data?.pagination;

  const hasActiveFilters =
    search ||
    category !== "ALL" ||
    status !== "ALL" ||
    type !== "ALL" ||
    featured !== "ALL";

  function resetFilters() {
    setSearch("");
    setCategory("ALL");
    setStatus("ALL");
    setType("ALL");
    setFeatured("ALL");
    setPage(1);
  }

  function handleFilterChange(fn: () => void) {
    fn();
    setPage(1); // reset page on filter change
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your portfolio projects
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) =>
              handleFilterChange(() => setSearch(e.target.value))
            }
            className="pl-9"
          />
        </div>

        {/* Category */}
        <Select
          value={category}
          onValueChange={(v) =>
            handleFilterChange(() => setCategory(v as ProjectCategory | "ALL"))
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status */}
        <Select
          value={status}
          onValueChange={(v) =>
            handleFilterChange(() => setStatus(v as ProjectStatus | "ALL"))
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type */}
        <Select
          value={type}
          onValueChange={(v) =>
            handleFilterChange(() => setType(v as ProjectType | "ALL"))
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            {Object.entries(typeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Featured */}
        <Select
          value={featured}
          onValueChange={(v) =>
            handleFilterChange(() => setFeatured(v as "ALL" | "true" | "false"))
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Featured" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="true">Featured</SelectItem>
            <SelectItem value="false">Not Featured</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset */}
        {hasActiveFilters && (
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

      {isError && <ProjectsErrorAlert />}

      <ProjectsTable projects={projects} isPending={isPending} />

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
