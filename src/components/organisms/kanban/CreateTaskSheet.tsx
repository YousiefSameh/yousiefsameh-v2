"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TaskStatus, TaskPriority } from "@/app/generated/prisma/client";
import { useCreateTask } from "@/features/admin/tasks/hooks";
import { KANBAN_COLUMN_LABELS } from "@/lib/kanban/constants";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
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
import { createTaskFormSchema, CreateTaskFormValues } from "@/validations/tasks.validation";
import { Plus } from "lucide-react";

const STATUS_OPTIONS: TaskStatus[] = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "URGENT", label: "Urgent" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
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
  const { mutate: createTask, isPending } = useCreateTask(projectId);

  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskFormSchema),
    defaultValues: {
      title: "",
      status: defaultStatus,
      priority: "MEDIUM",
      labelIds: [],
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: "",
        status: defaultStatus,
        priority: "MEDIUM",
        labelIds: [],
      });
    }
  }, [open, defaultStatus, form]);

  function onSubmit(values: CreateTaskFormValues) {
    createTask(values, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  }

  function handleOpenChange(next: boolean) {
    if (isPending && !next) return;
    onOpenChange(next);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button size="lg" className="min-w-24 cursor-pointer">New Task <Plus/></Button>
      </SheetTrigger>
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
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-5 p-4 pt-0"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What needs to be done?"
                      className="outline-none ring-0"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {KANBAN_COLUMN_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
