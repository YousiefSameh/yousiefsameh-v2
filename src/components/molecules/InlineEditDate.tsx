"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/button";
import { Calendar } from "@/components/atoms/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/popover";

interface InlineEditDateProps {
  value: Date | null;
  onSave: (v: Date | null) => void;
  isPending: boolean;
  className?: string;
}

export function InlineEditDate({
  value,
  onSave,
  isPending,
  className,
}: InlineEditDateProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    onSave(date ?? null);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave(null);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className={cn(
            "group relative flex items-center h-8 min-h-8 rounded-md px-2 -mx-2 hover:bg-muted/50 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring text-sm",
            isPending && "opacity-50 pointer-events-none",
            !value && "text-muted-foreground",
            className
          )}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen(true);
            }
          }}
        >
          <CalendarIcon className="mr-2 size-4" />
          {value ? format(value, "PPP") : <span>No due date</span>}
          {value && !isPending && (
            <Button
              size="icon"
              variant="ghost"
              className="ml-auto size-5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-muted"
              onClick={handleClear}
              aria-label="Clear date"
            >
              <X className="size-3 text-muted-foreground" />
            </Button>
          )}
          {isPending && (
            <Loader2 className="ml-auto size-3.5 animate-spin text-muted-foreground" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ?? undefined}
          onSelect={handleSelect}
          initialFocus
        />
        {value && (
          <div className="p-2 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-center text-xs h-7 text-muted-foreground"
              onClick={handleClear}
            >
              Clear due date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
