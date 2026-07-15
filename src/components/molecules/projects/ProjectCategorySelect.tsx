"use client";

import { ProjectCategory } from "@/app/generated/prisma/browser";
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

const categoryLabels: Record<ProjectCategory, string> = {
  WEB_APP: "Web Application",
  SAAS: "SaaS",
  MOBILE: "Mobile",
  LANDING_PAGE: "Landing Page",
  E_COMMERCE: "E-commerce",
  OTHER: "Other",
};

interface ProjectCategorySelectProps {
  form: UseFormReturn<ProjectFormValues>;
}

export function ProjectCategorySelect({ form }: ProjectCategorySelectProps) {
  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Category *</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Object.entries(categoryLabels).map(([value, label]) => (
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
