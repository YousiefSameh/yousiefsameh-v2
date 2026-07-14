"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Tag } from "lucide-react";
import { TaskLabel } from "@/app/generated/prisma/client";
import { TaskLabelChip } from "@/components/atoms/TaskLabelChip";
import { Button } from "@/components/atoms/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/atoms/command";
import { cn } from "@/lib/utils";

interface LabelSelectProps {
  labels: TaskLabel[];
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

/**
 * Multi-select label picker backed by a Popover + Command list.
 * Renders selected labels as `TaskLabelChip` pills above the trigger button.
 * Toggling a label adds/removes it from the selected IDs array.
 */
export function LabelSelect({
  labels,
  value,
  onChange,
  disabled = false,
}: LabelSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedLabels = labels.filter((l) => value.includes(l.id));

  function toggle(labelId: string) {
    if (value.includes(labelId)) {
      onChange(value.filter((id) => id !== labelId));
    } else {
      onChange([...value, labelId]);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Selected label chips */}
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5" role="list" aria-label="Selected labels">
          {selectedLabels.map((label) => (
            <div key={label.id} role="listitem">
              <TaskLabelChip label={label} />
            </div>
          ))}
        </div>
      )}

      {/* Picker trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            aria-label="Select labels"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              <Tag className="size-3.5" aria-hidden />
              {selectedLabels.length > 0
                ? `${selectedLabels.length} label${selectedLabels.length > 1 ? "s" : ""} selected`
                : "Add labels"}
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" aria-hidden />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-56 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search labels…" />
            <CommandList>
              <CommandEmpty>No labels found.</CommandEmpty>
              <CommandGroup>
                {labels.map((label) => {
                  const isSelected = value.includes(label.id);
                  return (
                    <CommandItem
                      key={label.id}
                      value={label.name}
                      onSelect={() => toggle(label.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4 shrink-0",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                        aria-hidden
                      />
                      <TaskLabelChip label={label} />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}