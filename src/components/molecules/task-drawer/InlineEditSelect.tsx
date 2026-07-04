"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/popover";
import { Button } from "@/components/atoms/button";

interface InlineEditSelectProps {
  value: string;
  options: { value: string; label: string }[];
  onSave: (v: string) => void;
  isPending: boolean;
  renderValue?: (v: string) => React.ReactNode;
  className?: string;
}

export function InlineEditSelect({
  value,
  options,
  onSave,
  isPending,
  renderValue,
  className,
}: InlineEditSelectProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (newValue: string) => {
    setOpen(false);
    if (newValue !== value) {
      onSave(newValue);
    }
  };

  const displayLabel =
    options.find((opt) => opt.value === value)?.label ?? value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={isPending}>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-8 min-h-8 justify-start gap-2 border-transparent bg-transparent hover:bg-muted/50 px-2 -mx-2 shadow-none font-normal",
            isPending && "opacity-50 pointer-events-none",
            className
          )}
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          ) : (
            <ChevronsUpDown className="size-3.5 text-muted-foreground shrink-0 opacity-50" />
          )}
          {renderValue ? renderValue(value) : <span>{displayLabel}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="start">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={cn(
              "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted/80 transition-colors cursor-pointer text-left",
              opt.value === value && "bg-muted"
            )}
            onClick={() => handleSelect(opt.value)}
          >
            <Check
              className={cn(
                "size-3.5 shrink-0",
                opt.value === value ? "opacity-100" : "opacity-0"
              )}
            />
            {opt.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
