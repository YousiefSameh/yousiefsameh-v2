"use client";

import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/atoms/card";
import { ReportRow } from "./ReportRow";
import { ReportRowSkeleton } from "./ReportRowSkeleton";
import { ReportWithMeta } from "@/features/admin/reports/api";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/atoms/empty";

interface ReportsTableProps {
  reports:   ReportWithMeta[];
  projectId: string;
  isPending: boolean;
}

export function ReportsTable({
  reports,
  projectId,
  isPending,
}: ReportsTableProps) {
  return (
    <Card className="py-0">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Report
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Activity
                </th>
                <th className="text-right p-4 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isPending
                ? Array.from({ length: 4 }).map((_, i) => (
                    <ReportRowSkeleton key={i} />
                  ))
                : reports.map((report) => (
                    <ReportRow
                      key={report.id}
                      report={report}
                      projectId={projectId}
                    />
                  ))}
            </tbody>
          </table>

          {!isPending && reports.length === 0 && (
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia>
                  <FileText
                    className="size-10 text-muted-foreground/50"
                    aria-hidden
                  />
                </EmptyMedia>
                <EmptyTitle>No reports yet</EmptyTitle>
                <EmptyDescription>
                  Create your first weekly report to share progress with your
                  client.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </CardContent>
    </Card>
  );
}