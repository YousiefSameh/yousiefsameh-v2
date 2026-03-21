"use client";

import { Badge } from "@/components/atoms/badge";
import { ProjectStatus } from "@/app/generated/prisma/browser";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

const variantMap: Record<ProjectStatus, "default" | "outline" | "secondary"> = {
  COMPLETED: "default",
  IN_PROGRESS: "outline",
  UNDER_DEVELOPMENT: "secondary",
};

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  return (
    <Badge variant={variantMap[status]} className="capitalize">
      {status.toLowerCase().replace(/_/g, " ")}
    </Badge>
  );
}
