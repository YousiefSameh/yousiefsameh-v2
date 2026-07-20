"use client";

import { useEffect } from "react";
import {
  TaskStatus,
  TaskPriority,
  TaskType,
} from "@/app/generated/prisma/client";
import { KANBAN_COLUMN_LABELS } from "@/lib/kanban/constants";
import { useCreateTaskForm } from "@/features/admin/tasks/create/hooks/useCreateTaskForm";
import { LabelSelect } from "@/features/admin/tasks/labels/components/LabelSelect";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/atoms/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/atoms/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/button";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "BACKLOG", label: "Backlog" },
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "REVIEW", label: "Review" },
  { value: "DONE", label: "Done" },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "URGENT", label: "Urgent" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

const TYPE_OPTIONS: { value: TaskType; label: string }[] = [
  { value: "FEATURE", label: "Feature" },
  { value: "BUG", label: "Bug" },
  { value: "CHORE", label: "Chore" },
  { value: "REFACTOR", label: "Refactor" },
  { value: "MEETING", label: "Meeting" },
  { value: "OTHER", label: "Other" },
];

interface CreateTaskSheetProps {
  projectId: string;
  open: boolean;
  defaultStatus: TaskStatus;
  onOpenChange: (open: boolean) => void;
}

export function CreateTaskSheet({
  projectId,
  open,
  defaultStatus,
  onOpenChange,
}: CreateTaskSheetProps) {
  const { form, onSubmit, isPending, labels, reset } = useCreateTaskForm({
    projectId,
    defaultStatus,
    onSuccess: () => onOpenChange(false),
  });

  // Reset form to the new defaultStatus whenever the sheet opens
  useEffect(() => {
    if (open) reset(defaultStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultStatus]);

  function handleOpenChange(next: boolean) {
    // Prevent accidental close while a mutation is in-flight
    if (isPending && !next) return;
    onOpenChange(next);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-primary">New task</SheetTitle>
          <SheetDescription>
            Add a task to{" "}
            <span className="font-medium text-foreground">
              {KANBAN_COLUMN_LABELS[defaultStatus]}
            </span>
            . You can fill in more details after creation.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="flex flex-1 flex-col gap-5 overflow-y-auto p-4 pt-0"
          >
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What needs to be done?"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUS_OPTIONS.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TYPE_OPTIONS.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Labels */}
            <FormField
              control={form.control}
              name="labelIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Labels</FormLabel>
                  <FormControl>
                    <LabelSelect
                      labels={labels}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex-1" />

            <SheetFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating…" : "Create task"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
