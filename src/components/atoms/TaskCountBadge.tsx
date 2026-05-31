import { MessageSquare, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCountBadgeProps {
  comments: number;
  attachments: number;
  className?: string;
}

/**
 * Renders comment and attachment counts for a task card footer.
 *
 * Returns null when both counts are zero so the card footer row stays
 * clean and the caller does not need to conditionally render this component.
 *
 * Each count is only rendered when non-zero, so a task with 2 comments
 * and 0 attachments shows only the comment count.
 *
 * Usage:
 *   <TaskCountBadge comments={task._count.comments} attachments={task._count.attachments} />
 */
export function TaskCountBadge({
  comments,
  attachments,
  className,
}: TaskCountBadgeProps) {
  if (comments === 0 && attachments === 0) return null;

  return (
    <div
      className={cn("flex items-center gap-2.5", className)}
      aria-label={[
        comments > 0 ? `${comments} comment${comments !== 1 ? "s" : ""}` : "",
        attachments > 0
          ? `${attachments} attachment${attachments !== 1 ? "s" : ""}`
          : "",
      ]
        .filter(Boolean)
        .join(", ")}
    >
      {comments > 0 && (
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
          <MessageSquare className="size-3 shrink-0" aria-hidden="true" />
          {comments}
        </span>
      )}
      {attachments > 0 && (
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
          <Paperclip className="size-3 shrink-0" aria-hidden="true" />
          {attachments}
        </span>
      )}
    </div>
  );
}
