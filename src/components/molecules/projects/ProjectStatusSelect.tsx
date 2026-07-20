"use client";

import { ProjectStatus } from "@/app/generated/prisma/browser";
import {
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
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "@/features/admin/projects/validations/projects.validation";

const statusLabels: Record<ProjectStatus, string> = {
  COMPLETED: "Completed",
  IN_PROGRESS: "In Progress",
  UNDER_DEVELOPMENT: "Under Development",
};

interface ProjectStatusSelectProps {
  form: UseFormReturn<ProjectFormValues>;
}

export function ProjectStatusSelect({ form }: ProjectStatusSelectProps) {
  return (
    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Status *</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Object.entries(statusLabels).map(([value, label]) => (
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
  );
}
