"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/atoms/form";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "@/validations/projects.validation";
import { RichTextEditor } from "@/components/molecules/rich-text-editor/Editor";

interface DescriptionCardProps {
  form: UseFormReturn<ProjectFormValues>;
}

export function DescriptionCard({ form }: DescriptionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Description</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="fullDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Description (Rich Text)</FormLabel>
              <FormControl>
                <RichTextEditor field={field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}