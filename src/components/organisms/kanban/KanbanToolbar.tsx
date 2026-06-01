"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/button";
import { GetTasksParams } from "@/features/admin/tasks/api";

/** Debounce delay in ms before the search query is committed to params. */
const SEARCH_DEBOUNCE_MS = 300;

interface KanbanToolbarProps {
  params: GetTasksParams;
  onChange: (next: GetTasksParams) => void;
}

export function KanbanToolbar({ params, onChange }: KanbanToolbarProps) {
  const [searchValue, setSearchValue] = useState<string>(params.search ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearchValue(value);

    // Clear any pending debounce timer
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      onChange({ ...params, search: value.trim() || undefined });
    }, SEARCH_DEBOUNCE_MS);
  }

  function handleClear() {
    // Cancel any pending debounced search before it fires
    if (debounceRef.current) clearTimeout(debounceRef.current);

    setSearchValue("");
    onChange({ ...params, search: undefined });
  }

  return (
    <div className="flex items-center w-full gap-2">
      <div className="relative w-full">
        <Search
          className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          aria-label="Search tasks"
          placeholder="Search tasks…"
          value={searchValue}
          onChange={handleSearchChange}
          className="h-8 pl-8 pr-7 text-sm outline-none focus-visible:outline-none focus-visible:ring-0"
        />
        {searchValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 size-5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="size-3" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
