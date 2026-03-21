"use client";

import { Badge } from "@/components/atoms/badge";
import { ProjectCategory } from "@/app/generated/prisma/browser";

interface ProjectCategoryBadgeProps {
  category: ProjectCategory;
}

export function ProjectCategoryBadge({ category }: ProjectCategoryBadgeProps) {
  return (
    <Badge variant="secondary" className="capitalize">
      {category.toLowerCase().replace(/_/g, " ")}
    </Badge>
  );
}