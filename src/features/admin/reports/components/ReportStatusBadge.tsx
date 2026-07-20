"use client";

import { Badge } from "@/components/atoms/badge";
import { ReportStatus } from "@/app/generated/prisma/enums";

interface ReportStatusBadgeProps {
  status: ReportStatus | null | undefined;
}

const CONFIG: Record<
  ReportStatus,
  { label: string; variant: "default" | "outline" | "secondary" }
> = {
  PUBLISHED: { label: "Published", variant: "default" },
  DRAFT: { label: "Draft", variant: "secondary" },
};

/**
 * Pill badge for a WeeklyReport status value.
 * Renders a neutral fallback when status is null/undefined (new reports).
 */
export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  if (!status) {
    return (
      <Badge variant="outline" className="capitalize">
        Draft
      </Badge>
    );
  }
  const { label, variant } = CONFIG[status];
  return <Badge variant={variant}>{label}</Badge>;
}
