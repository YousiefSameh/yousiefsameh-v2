"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "@/validations/projects.validation";
import { FormInput } from "@/components/molecules/form-input";

interface TechStackCardProps {
  form: UseFormReturn<ProjectFormValues>;
}

export function TechStackCard({ form }: TechStackCardProps) {
  const [display, setDisplay] = useState(() =>
    form.getValues("techStack").join(", "),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tech Stack & Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="React, Next.js, TypeScript"
          value={display}
          onChange={(e) => {
            setDisplay(e.target.value);
            form.setValue(
              "techStack",
              e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
              { shouldValidate: true },
            );
          }}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            control={form.control}
            name="liveUrl"
            label="Live Demo URL"
            placeholder="https://..."
          />
          <FormInput
            control={form.control}
            name="repoUrl"
            label="GitHub URL"
            placeholder="https://github.com/..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
