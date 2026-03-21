"use client";

import { ProjectType } from "@/app/generated/prisma/browser";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/atoms/form";
import { RadioGroup, RadioGroupItem } from "@/components/atoms/radio-group";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "@/validations/projects.validation";

interface ProjectTypeSelectorProps {
  form: UseFormReturn<ProjectFormValues>;
}

export function ProjectTypeSelector({ form }: ProjectTypeSelectorProps) {
  return (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Project Type</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className="flex flex-col space-y-1"
            >
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value={ProjectType.PORTFOLIO} />
                </FormControl>
                <FormLabel className="font-normal">
                  Portfolio (Personal Showcase)
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value={ProjectType.CLIENT} />
                </FormControl>
                <FormLabel className="font-normal">Client Project</FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
