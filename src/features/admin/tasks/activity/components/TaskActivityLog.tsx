"use client";

import { formatDistanceToNow, format } from "date-fns";
import {
  Plus,
  ArrowRightLeft,
  Flag,
  Tag,
  Calendar,
  User,
  Eye,
  MoveRight,
  MessageSquare,
  MessageSquareX,
  Paperclip,
  Trash2,
  Activity,
  Edit,
} from "lucide-react";
import { ActivityAction } from "@/app/generated/prisma/enums";
import { ActivityLog } from "@/app/generated/prisma/client";
import { useTaskActivity } from "@/features/admin/tasks/activity/hooks";
import { Button } from "@/components/atoms/button";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/atoms/empty";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shape of one diff field as stored in the ActivityLog.diff JSON column */
type DiffEntry = { from: unknown; to: unknown };
type Diff = Record<string, DiffEntry>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDiff(raw: unknown): Diff | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  return raw as Diff;
}

function formatDiffValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "visible" : "hidden";
  // ISO date strings → human-readable
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    try {
      return format(new Date(value), "MMM d, yyyy");
    } catch {
      return value;
    }
  }
  return String(value);
}

// ─── Action → icon and label maps ────────────────────────────────────────────

const ACTION_ICON: Record<ActivityAction, React.ElementType> = {
  TASK_CREATED:           Plus,
  TASK_UPDATED:           Edit,
  TASK_STATUS_CHANGED:    ArrowRightLeft,
  TASK_PRIORITY_CHANGED:  Flag,
  TASK_TYPE_CHANGED:      Tag,
  TASK_ASSIGNEE_CHANGED:  User,
  TASK_DUE_DATE_CHANGED:  Calendar,
  TASK_LABELS_CHANGED:    Tag,
  TASK_VISIBILITY_CHANGED: Eye,
  TASK_MOVED:             MoveRight,
  COMMENT_ADDED:          MessageSquare,
  COMMENT_UPDATED:        Edit,
  COMMENT_DELETED:        MessageSquareX,
  FILE_UPLOADED:          Paperclip,
  FILE_DELETED:           Trash2,
  REPORT_CREATED:         Plus,
  REPORT_UPDATED:         Edit,
  REPORT_PUBLISHED:       Eye,
};

const ACTION_LABEL: Record<ActivityAction, (diff?: Diff) => string> = {
  TASK_CREATED:           () => "Task created",
  TASK_UPDATED:           () => "Task updated",
  TASK_STATUS_CHANGED:    (d) => `Status changed to ${formatDiffValue(d?.status?.to)}`,
  TASK_PRIORITY_CHANGED:  (d) => `Priority changed to ${formatDiffValue(d?.priority?.to)}`,
  TASK_TYPE_CHANGED:      (d) => `Type changed to ${formatDiffValue(d?.type?.to)}`,
  TASK_ASSIGNEE_CHANGED:  () => "Assignee changed",
  TASK_DUE_DATE_CHANGED:  (d) => `Due date set to ${formatDiffValue(d?.dueDate?.to)}`,
  TASK_LABELS_CHANGED:    () => "Labels updated",
  TASK_VISIBILITY_CHANGED: (d) =>
    `Visibility set to ${d?.isClientVisible?.to ? "visible to client" : "hidden from client"}`,
  TASK_MOVED:             (d) => `Moved to ${formatDiffValue(d?.status?.to)}`,
  COMMENT_ADDED:          () => "Comment added",
  COMMENT_UPDATED:        () => "Comment edited",
  COMMENT_DELETED:        () => "Comment deleted",
  FILE_UPLOADED:          (d) => `File uploaded: ${formatDiffValue(d?.fileName?.to)}`,
  FILE_DELETED:           (d) => `File deleted: ${formatDiffValue(d?.fileName?.from)}`,
  REPORT_CREATED:         () => "Report created",
  REPORT_UPDATED:         () => "Report updated",
  REPORT_PUBLISHED:       () => "Report published",
};

// ─── Single entry ─────────────────────────────────────────────────────────────

function ActivityEntry({ log }: { log: ActivityLog }) {
  const action = log.action as ActivityAction;
  const Icon = ACTION_ICON[action] ?? Activity;
  const diff = parseDiff(log.diff);
  const labelFn = ACTION_LABEL[action] ?? (() => "Task updated");
  const description = labelFn(diff);
  const timeAgo = formatDistanceToNow(new Date(log.createdAt), {
    addSuffix: true,
  });

  return (
    <div className="flex gap-3">
      {/* Icon bubble */}
      <div
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
          "bg-muted text-muted-foreground",
        )}
        aria-hidden
      >
        <Icon className="size-3.5" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pb-4">
        <p className="text-sm text-foreground">{description}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo}</p>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ActivityEntrySkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton className="mt-0.5 size-7 shrink-0 rounded-full" />
      <div className="flex-1 space-y-1.5 pb-4">
        <Skeleton className="h-3.5 w-48 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface TaskActivityLogProps {
  projectId: string;
  taskId: string;
}

export function TaskActivityLog({ projectId, taskId }: TaskActivityLogProps) {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useTaskActivity(projectId, taskId);

  // Flatten pages into a single log array
  const logs = data?.pages.flatMap((page) => page.data ?? []) ?? [];

  if (isLoading) {
    return (
      <div aria-busy="true" aria-label="Loading activity">
        {Array.from({ length: 5 }).map((_, i) => (
          <ActivityEntrySkeleton key={i} />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <Empty className="border-dashed py-8">
        <EmptyHeader>
          <EmptyMedia>
            <Activity className="size-8 text-muted-foreground" aria-hidden />
          </EmptyMedia>
          <EmptyTitle>No activity yet</EmptyTitle>
          <EmptyDescription>
            Changes to this task will appear here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div>
      {/* Timeline */}
      <div
        role="list"
        aria-label="Task activity"
        className="relative border-l border-border pl-4 ml-3.5"
      >
        {logs.map((log) => (
          <div key={log.id} role="listitem">
            <ActivityEntry log={log} />
          </div>
        ))}
      </div>

      {/* Load more */}
      {hasNextPage && (
        <div className="mt-2 flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-muted-foreground"
          >
            {isFetchingNextPage ? (
              <>
                <Spinner className="mr-2 size-4" />
                Loading…
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}