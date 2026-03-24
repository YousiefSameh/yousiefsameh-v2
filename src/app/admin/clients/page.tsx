"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Plus, Search, X } from "lucide-react";
import { ClientsTable } from "@/components/organisms/clients/ClientsTable";
import { useAdminClients } from "@/features/admin/clients/hooks";
import { Pagination } from "@/components/molecules/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { ClientsErrorAlert } from "@/components/molecules/clients/ClientsErrorAlert";

const COMMON_TAGS = ["vip", "high-budget", "slow-payer", "repeat-client", "lead"];

export default function AdminClientsPage() {
  const [page, setPage]   = useState(1);
  const [search, setSearch] = useState("");
  const [tag, setTag]     = useState<string | undefined>(undefined);

  const debouncedSearch = useDebounce(search, 400);

  const { data, isPending, isError } = useAdminClients({
    page,
    limit:  10,
    search: debouncedSearch || undefined,
    tag,
  });

  const clients    = data?.data ?? [];
  const pagination = data?.pagination;

  const hasActiveFilters = search || tag;

  function resetFilters() {
    setSearch("");
    setTag(undefined);
    setPage(1);
  }

  function handleFilterChange(fn: () => void) {
    fn();
    setPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground mt-1">
            Manage your clients and their projects
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
            className="pl-9"
          />
        </div>

        {/* Tag filters */}
        <div className="flex flex-wrap gap-2">
          {COMMON_TAGS.map((t) => (
            <button
              key={t}
              onClick={() =>
                handleFilterChange(() => setTag(tag === t ? undefined : t))
              }
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                tag === t
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

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

      {isError && <ClientsErrorAlert />}

      <ClientsTable clients={clients} isPending={isPending} />

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