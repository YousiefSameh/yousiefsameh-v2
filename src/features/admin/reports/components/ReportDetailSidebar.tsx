"use client";

import { formatDistanceToNow, format } from "date-fns";
import { Globe, EyeOff, Loader2, Trash } from "lucide-react";
import { ReportWithMeta } from "@/features/admin/reports/api";
import { usePublishReport } from "@/features/admin/reports/hooks";
import { ReportStatusBadge } from "@/features/admin/reports/components/ReportStatusBadge";
import { Button } from "@/components/atoms/button";
import { Separator } from "@/components/atoms/separator";
import { toast } from "sonner";
import Link from "next/link";

interface ReportDetailSidebarProps {
  report: ReportWithMeta;
  projectId: string;
}

export function ReportDetailSidebar({
  report,
  projectId,
}: ReportDetailSidebarProps) {
  const { mutate: togglePublish, isPending: isPublishing } = usePublishReport(
    projectId,
    report.id,
  );

  const isPublished = report.status === "PUBLISHED";

  function handlePublish() {
    togglePublish(undefined, {
      onSuccess: (res) => {
        const next = res.data?.status;
        toast.success(
          next === "PUBLISHED" ? "Report published" : "Report unpublished",
        );
      },
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
          Status
        </p>
        <ReportStatusBadge status={report.status} />
      </div>

      {/* Publish / unpublish */}
      <Button
        variant={isPublished ? "outline" : "default"}
        size="sm"
        className="w-full gap-2"
        onClick={handlePublish}
        disabled={isPublishing}
      >
        {isPublishing ? (
          <Loader2 className="size-4 animate-spin" />
        ) : isPublished ? (
          <>
            <EyeOff className="size-4" />
            Unpublish
          </>
        ) : (
          <>
            <Globe className="size-4" />
            Publish
          </>
        )}
      </Button>

      <Separator />
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground shrink-0">Created</span>
          <span
            className="text-right text-xs text-foreground"
            title={format(new Date(report.createdAt), "PPP p")}
          >
            {formatDistanceToNow(new Date(report.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground shrink-0">Updated</span>
          <span
            className="text-right text-xs text-foreground"
            title={format(new Date(report.updatedAt), "PPP p")}
          >
            {formatDistanceToNow(new Date(report.updatedAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground shrink-0">Comments</span>
          <span className="text-foreground">{report._count.comments}</span>
        </div>

        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground shrink-0">Attachments</span>
          <span className="text-foreground">{report._count.attachments}</span>
        </div>
      </div>

      <Separator />

      <Button
        asChild
        variant="destructive"
        size="default"
        className="w-full gap-2"
      >
        <Link href={`/admin/projects/${projectId}/reports`}>
          <Trash className="size-4" />
          Delete
        </Link>
      </Button>
    </div>
  );
}
