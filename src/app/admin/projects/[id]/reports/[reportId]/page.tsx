"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { type JSONContent } from "@tiptap/core";
import { toast } from "sonner";
import {
  useAdminReport,
  useUpdateReport,
} from "@/features/admin/reports/hooks";
import { useDebounce } from "@/hooks/useDebounce";
import { ReportEditor } from "@/features/admin/reports/components/ReportEditor";
import { ReportDetailSidebar } from "@/features/admin/reports/components/ReportDetailSidebar";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Skeleton } from "@/components/atoms/skeleton";

export default function ReportDetailPage() {
  const { id: projectId, reportId } = useParams<{
    id: string;
    reportId: string;
  }>();
  const router = useRouter();

  const { data, isLoading, isError } = useAdminReport(projectId, reportId);
  const report = data?.data;

  const { mutate: updateReport, isPending: isSaving } = useUpdateReport(
    projectId,
    reportId,
  );

  const [title, setTitle] = useState("");

  useEffect(() => {
    if (report?.title) setTitle(report.title);
  }, [report?.title]);

  const debouncedTitle = useDebounce(title, 600);

  useEffect(() => {
    if (!report) return;
    if (!debouncedTitle.trim()) return;
    if (debouncedTitle === report.title) return;

    updateReport(
      { title: debouncedTitle.trim() },
      { onError: (err) => toast.error(err.message) },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTitle]);

  const handleContentSave = useCallback(
    (content: JSONContent) => {
      updateReport({ content }, { onError: (err) => toast.error(err.message) });
    },
    [updateReport],
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-[500px] w-full rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-px w-full" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-sm text-muted-foreground">
          Report not found or failed to load.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/admin/projects/${projectId}/reports`)}
        >
          Back to reports
        </Button>
      </div>
    );
  }

  const isPublished = report.status === "PUBLISHED";

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
        onClick={() => router.push(`/admin/projects/${projectId}/reports`)}
      >
        <ArrowLeft className="size-4" />
        All reports
      </Button>

      {/* Inline title — auto-saves via debounce */}
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isPublished}
        placeholder="Report title…"
        className="text-2xl font-semibold border-0 shadow-none px-0 h-auto focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50 disabled:opacity-70 disabled:cursor-not-allowed"
      />

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">
        {/* Left — editor */}
        <ReportEditor
          initialContent={report.content as JSONContent | null}
          onSave={handleContentSave}
          readOnly={isPublished}
          isSaving={isSaving}
        />

        {/* Right — sidebar */}
        <aside className="lg:sticky lg:top-6">
          <ReportDetailSidebar report={report} projectId={projectId} />
        </aside>
      </div>
    </div>
  );
}
