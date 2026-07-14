"use client";

import { Client, ProjectType } from "@/app/generated/prisma/browser";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { ProjectTypeSelector } from "@/components/molecules/projects/ProjectTypeSelector";
import { ClientSelector } from "@/components/molecules/projects/ClientSelector";
import { ProjectCategorySelect } from "@/components/molecules/projects/ProjectCategorySelect";
import { ProjectStatusSelect } from "@/components/molecules/projects/ProjectStatusSelect";
import { FormInput } from "@/components/molecules/form-input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/atoms/form";
import { Input } from "@/components/atoms/input";
import { ProjectFormValues } from "@/validations/projects.validation";
import { UseFormReturn, useWatch } from "react-hook-form";
import { Button } from "@/components/atoms/button";
import { Wand2 } from "lucide-react";

interface BasicInfoCardProps {
  form: UseFormReturn<ProjectFormValues>;
  clients: Client[];
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function BasicInfoCard({ form, clients }: BasicInfoCardProps) {
  const projectType = useWatch({
    control: form.control,
    name: "type",
  });

  function handleGenerateSlug() {
    const title = form.getValues("title");
    if (!title) return;
    form.setValue("slug", generateSlug(title), { shouldValidate: true });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProjectTypeSelector form={form} />

        {projectType === ProjectType.CLIENT && (
          <ClientSelector form={form} clients={clients} />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            control={form.control}
            name="title"
            label="Title *"
            placeholder="Project title"
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Slug *</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input {...field} placeholder="my-project-name" />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateSlug}
                    className="shrink-0 h-full gap-2"
                    title="Generate from title"
                  >
                    <Wand2 className="h-4 w-4" />
                    <span className="hidden lg:inline">Generate</span>
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormInput
          control={form.control}
          name="shortDescription"
          label="Short Description *"
          placeholder="Brief description for cards..."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <ProjectCategorySelect form={form} />
          <ProjectStatusSelect form={form} />
          <FormInput
            control={form.control}
            name="year"
            label="Year"
            placeholder="Year"
          />
        </div>
      </CardContent>
    </Card>
  );
}
