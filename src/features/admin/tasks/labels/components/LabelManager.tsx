"use client";

import { useState } from "react";
import { Edit2, Trash2, X, Check, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/popover";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { TaskLabelChip } from "@/components/atoms/TaskLabelChip";
import { LabelColorPicker } from "@/components/molecules/LabelColorPicker";
import {
  useProjectLabels,
  useCreateLabel,
  useUpdateLabel,
  useDeleteLabel,
} from "@/features/admin/tasks/labels/hooks";
import { TaskLabel } from "@/app/generated/prisma/client";

interface LabelManagerProps {
  projectId: string;
  children: React.ReactNode;
}

export function LabelManager({ projectId, children }: LabelManagerProps) {
  const [open, setOpen] = useState(false);

  const { data: labelsResponse, isLoading } = useProjectLabels(projectId);
  const labels = labelsResponse?.data ?? [];

  const createLabelMutation = useCreateLabel(projectId);
  const updateLabelMutation = useUpdateLabel(projectId);
  const deleteLabelMutation = useDeleteLabel(projectId);

  const [createName, setCreateName] = useState("");
  const [createColor, setCreateColor] = useState<string>("#64748b");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleCreate = () => {
    if (!createName.trim()) return;
    createLabelMutation.mutate(
      { name: createName.trim(), color: createColor },
      {
        onSuccess: () => {
          setCreateName("");
          setCreateColor("#64748b");
        },
      },
    );
  };

  const startEdit = (label: TaskLabel) => {
    setEditingId(label.id);
    setEditName(label.name);
    setEditColor(label.color ?? "#64748b");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditColor("");
  };

  const handleUpdate = (id: string) => {
    if (!editName.trim()) return;
    updateLabelMutation.mutate(
      { labelId: id, payload: { name: editName.trim(), color: editColor } },
      {
        onSuccess: () => {
          cancelEdit();
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    deleteLabelMutation.mutate(id);
  };

  return (
    <Popover open={open} modal={true} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b border-border">
          <h4 className="font-semibold text-sm mb-3">Manage Labels</h4>
          <div className="space-y-2">
            <Input
              placeholder="Label name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              className="h-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreate();
                }
              }}
            />
            <div className="flex items-center justify-between">
              <LabelColorPicker value={createColor} onChange={setCreateColor} />
              <Button
                size="sm"
                className="h-8 px-3 ml-2 shrink-0"
                onClick={handleCreate}
                disabled={!createName.trim() || createLabelMutation.isPending}
              >
                {createLabelMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : labels.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No labels found.
            </p>
          ) : (
            labels.map((label: TaskLabel) => {
              const isEditing = editingId === label.id;

              if (isEditing) {
                return (
                  <div
                    key={label.id}
                    className="p-2 border border-border rounded-md space-y-2 bg-muted/50"
                  >
                    <Input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 text-sm bg-background"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleUpdate(label.id);
                        } else if (e.key === "Escape") {
                          cancelEdit();
                        }
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <LabelColorPicker
                        value={editColor}
                        onChange={setEditColor}
                      />
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7"
                          onClick={cancelEdit}
                          disabled={updateLabelMutation.isPending}
                        >
                          <X className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="default"
                          className="size-7"
                          onClick={() => handleUpdate(label.id)}
                          disabled={
                            !editName.trim() || updateLabelMutation.isPending
                          }
                        >
                          {updateLabelMutation.isPending ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Check className="size-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={label.id}
                  className="flex items-center justify-between group rounded-md p-1.5 hover:bg-muted/50"
                >
                  <TaskLabelChip label={label} />
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-6 h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={() => startEdit(label)}
                      disabled={deleteLabelMutation.isPending}
                    >
                      <Edit2 className="size-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-6 h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(label.id)}
                      disabled={deleteLabelMutation.isPending}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
