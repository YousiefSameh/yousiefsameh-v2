"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, MessageSquare, Paperclip } from "lucide-react";
import { type JSONContent } from "@tiptap/core";
import { toast } from "sonner";
import {
  useAdminReport,
  useUpdateReport,
} from "@/features/admin/reports/hooks";
import { useDebounce } from "@/hooks/useDebounce";
import {
  ReportEditor,
  ReportDetailSidebar,
} from "@/features/admin/reports/components";
import { ReportCommentThread } from "@/features/admin/reports/comments/components";
import { ReportAttachmentList } from "@/features/admin/reports/attachments/components";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Skeleton } from "@/components/atoms/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/atoms/tabs";

// Tab trigger style

const TRIGGER_CLASS =
  "rounded-none border-b-2 border-transparent data-[state=active]:border-primary " +
  "data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 h-full";

// Page

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

  // Inline title auto-save

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

  // Content auto-save on editor blur

  const handleContentSave = useCallback(
    (content: JSONContent) => {
      updateReport({ content }, { onError: (err) => toast.error(err.message) });
    },
    [updateReport],
  );

  // Loading state

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-125 w-full rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-px w-full" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
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
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
        onClick={() => router.push(`/admin/projects/${projectId}/reports`)}
      >
        <ArrowLeft className="size-4" />
        All reports
      </Button>

      {/* Inline title */}
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isPublished}
        placeholder="Report title…"
        className="text-2xl font-semibold border-0 shadow-none px-0 h-auto
                  focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50
                  disabled:opacity-70 disabled:cursor-not-allowed"
      />

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">
        {/* Left — tabbed content */}
        <Tabs defaultValue="content" className="w-full flex flex-col">
          <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0 h-10 mb-6">
            <TabsTrigger value="content" className={TRIGGER_CLASS}>
              <FileText className="size-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="comments" className={TRIGGER_CLASS}>
              <MessageSquare className="size-4 mr-2" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="attachments" className={TRIGGER_CLASS}>
              <Paperclip className="size-4 mr-2" />
              Attachments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-0">
            <ReportEditor
              initialContent={report.content as JSONContent | null}
              onSave={handleContentSave}
              readOnly={isPublished}
              isSaving={isSaving}
            />
          </TabsContent>

          <TabsContent value="comments" className="mt-0">
            <ReportCommentThread projectId={projectId} reportId={reportId} />
          </TabsContent>

          <TabsContent value="attachments" className="mt-0">
            <ReportAttachmentList projectId={projectId} reportId={reportId} />
          </TabsContent>
        </Tabs>

        {/* Right — metadata sidebar */}
        <aside className="lg:sticky lg:top-6">
          <ReportDetailSidebar report={report} projectId={projectId} />
        </aside>
      </div>
    </div>
  );
}
