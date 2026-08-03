"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useCreateReport } from "@/features/admin/reports/hooks";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
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
import { createReportSchema, CreateReportValues } from "@/features/admin/reports/validations";

interface CreateReportSheetProps {
  projectId: string;
}

export function CreateReportSheet({ projectId }: CreateReportSheetProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { mutate: createReport, isPending } = useCreateReport(projectId);

  const form = useForm<CreateReportValues>({
    resolver:      zodResolver(createReportSchema),
    defaultValues: { title: "" },
  });

  function handleOpenChange(next: boolean) {
    if (isPending && !next) return;
    setOpen(next);
    if (!next) form.reset();
  }

  function onSubmit(values: CreateReportValues) {
    createReport(values, {
      onSuccess: (response) => {
        toast.success("Report created");
        setOpen(false);
        form.reset();
        if (response.data?.id) {
          router.push(
            `/admin/projects/${projectId}/reports/${response.data.id}`,
          );
        }
      },
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New report
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-primary">New report</SheetTitle>
          <SheetDescription>
            Give the report a title. You can write the full content after
            creation.
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
                      placeholder="Week 24 — Progress update"
                      autoFocus
                      {...field}
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
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating…" : "Create report"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}