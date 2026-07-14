"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/atoms/form";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "@/validations/projects.validation";
import { ImageUpload } from "@/components/molecules/upload-images/ImageUpload"; 
import { MultiImageUpload } from "@/components/molecules/upload-images/MultiImageUpload";

interface ImagesCardProps {
  form: UseFormReturn<ProjectFormValues>;
}

export function ImagesCard({ form }: ImagesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="featuredImageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Image (used for cards & hero)</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  options={{ folder: "projects" }}
                />
              </FormControl>
              <FormDescription>
                Used for both card thumbnail and hero.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="galleryImages"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gallery Images</FormLabel>
              <FormControl>
                <MultiImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  options={{ folder: "projects/gallery" }}
                  maxFiles={12}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}