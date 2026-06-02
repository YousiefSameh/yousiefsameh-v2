"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/atoms/popover";
import { Checkbox } from "@/components/atoms/checkbox";
import { TaskLabelChip } from "@/components/atoms/TaskLabelChip";
import { useProjectLabels } from "@/features/admin/tasks/labels/hooks";

interface LabelSelectProps {
  projectId: string;
  currentLabelIds: string[];
  onLabelsChange: (labelIds: string[]) => void;
  disabled?: boolean;
}

export function LabelSelect({
  projectId,
  currentLabelIds,
  onLabelsChange,
  disabled,
}: LabelSelectProps) {
  const { data: labelsResponse, isLoading } = useProjectLabels(projectId);
  const labels = labelsResponse?.data ?? [];

  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(currentLabelIds);

  // Sync internal state when opened
  useEffect(() => {
    if (open) {
      setSelectedIds(currentLabelIds);
    } else {
      // When closing, if selectedIds differ from currentLabelIds, trigger onLabelsChange
      const changed =
        selectedIds.length !== currentLabelIds.length ||
        selectedIds.some((id) => !currentLabelIds.includes(id));
      
      if (changed) {
        onLabelsChange(selectedIds);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep in sync if currentLabelIds change externally while closed
  useEffect(() => {
    if (!open) {
      setSelectedIds(currentLabelIds);
    }
  }, [currentLabelIds, open]);

  const toggleLabel = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const selectedLabels = labels.filter((l) => currentLabelIds.includes(l.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className="flex flex-wrap items-center gap-1.5 min-h-[32px] p-1.5 rounded-md border border-dashed border-border hover:bg-muted/50 transition-colors text-left disabled:opacity-50 disabled:pointer-events-none"
        >
          {selectedLabels.length > 0 ? (
            selectedLabels.map((label) => (
              <TaskLabelChip key={label.id} label={label} />
            ))
          ) : (
            <span className="flex items-center text-xs text-muted-foreground px-1">
              <Plus className="size-3.5 mr-1" />
              Add label
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <div className="p-2 border-b border-border">
          <h4 className="font-medium text-xs text-muted-foreground">Assign labels</h4>
        </div>
        <div className="max-h-[240px] overflow-y-auto p-1">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : labels.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No labels found.
            </p>
          ) : (
            labels.map((label) => {
              const isChecked = selectedIds.includes(label.id);
              return (
                <div
                  key={label.id}
                  className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-muted/50 cursor-pointer"
                  onClick={() => toggleLabel(label.id)}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleLabel(label.id)}
                    className="pointer-events-none" // let the parent div handle the click
                  />
                  <TaskLabelChip label={label} />
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
