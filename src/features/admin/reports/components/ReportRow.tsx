"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Edit, MessageSquare, Paperclip } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { ReportStatusBadge } from "@/features/admin/reports/components/ReportStatusBadge";
import { DeleteReportButton } from "@/features/admin/reports/components/DeleteReportButton";
import { ReportWithMeta } from "@/features/admin/reports/api";

interface ReportRowProps {
  report:    ReportWithMeta;
  projectId: string;
}

export function ReportRow({ report, projectId }: ReportRowProps) {
  const updatedAt = formatDistanceToNow(new Date(report.updatedAt), {
    addSuffix: true,
  });

  return (
    <tr className="border-b border-border last:border-0 transition-colors hover:bg-muted/40">
      {/* Title */}
      <td className="p-4">
        <Link
          href={`/admin/projects/${projectId}/reports/${report.id}`}
          className="font-medium hover:text-primary transition-colors line-clamp-1"
        >
          {report.title}
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5">{updatedAt}</p>
      </td>

      {/* Status */}
      <td className="p-4">
        <ReportStatusBadge status={report.status} />
      </td>

      {/* Counts */}
      <td className="p-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MessageSquare className="size-3.5" aria-hidden />
            {report._count.comments}
          </span>
          <span className="flex items-center gap-1">
            <Paperclip className="size-3.5" aria-hidden />
            {report._count.attachments}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="p-4">
        <div className="flex items-center justify-end gap-1">
          <Button asChild variant="ghost" size="icon">
            <Link href={`/admin/projects/${projectId}/reports/${report.id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <DeleteReportButton projectId={projectId} reportId={report.id} />
        </div>
      </td>
    </tr>
  );
}