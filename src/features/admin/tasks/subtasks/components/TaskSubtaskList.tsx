"use client";

import { useRef, useState, useEffect } from "react";
import { ListTodo, ExternalLink, Unlink, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useTaskSubtasks,
  useCreateSubtask,
  useUnlinkSubtask,
  useToggleSubtaskDone,
} from "@/features/admin/tasks/subtasks/hooks";
import { SubtaskWithChild } from "@/features/admin/tasks/subtasks/api";
import { TaskStatus } from "@/app/generated/prisma/enums";
import { Checkbox } from "@/components/atoms/checkbox";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Progress } from "@/components/atoms/progress";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/atoms/empty";

function SubtaskSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2">
      <Skeleton className="size-4 shrink-0 rounded" />
      <Skeleton className="h-3.5 flex-1 rounded" />
    </div>
  );
}

interface SubtaskRowProps {
  subtask: SubtaskWithChild;
  projectId: string;
  parentTaskId: string;
  onOpen: (childTaskId: string) => void;
}

function SubtaskRow({
  subtask,
  projectId,
  parentTaskId,
  onOpen,
}: SubtaskRowProps) {
  const { childTask } = subtask;
  const isDone = childTask.status === TaskStatus.DONE;

  const { mutate: toggle, isPending: isToggling } = useToggleSubtaskDone(
    projectId,
    parentTaskId,
  );
  const { mutate: unlink, isPending: isUnlinking } = useUnlinkSubtask(
    projectId,
    parentTaskId,
  );

  function handleToggle() {
    toggle(
      { childTaskId: childTask.id, currentStatus: childTask.status ?? TaskStatus.TODO },
      {
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleUnlink() {
    unlink(childTask.id, {
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-md px-2 py-1.5",
        "transition-colors hover:bg-accent/40",
      )}
    >
      {/* Checkbox — toggles DONE ↔ TODO */}
      {isToggling ? (
        <Spinner className="size-4 shrink-0 text-muted-foreground" />
      ) : (
        <Checkbox
          id={`subtask-${childTask.id}`}
          checked={isDone}
          onCheckedChange={handleToggle}
          aria-label={`Mark "${childTask.title}" as ${isDone ? "incomplete" : "done"}`}
          className="shrink-0"
        />
      )}

      {/* Title */}
      <label
        htmlFor={`subtask-${childTask.id}`}
        className={cn(
          "flex-1 cursor-pointer truncate text-sm",
          isDone && "text-muted-foreground line-through",
        )}
      >
        {childTask.title}
      </label>

      {/* Actions — visible on hover */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        {/* Open child task in drawer */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => onOpen(childTask.id)}
          aria-label={`Open task: ${childTask.title}`}
        >
          <ExternalLink className="size-3.5" aria-hidden />
        </Button>

        {/* Unlink subtask */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-destructive"
          onClick={handleUnlink}
          disabled={isUnlinking}
          aria-label={`Unlink subtask: ${childTask.title}`}
        >
          {isUnlinking ? (
            <Spinner className="size-3.5" />
          ) : (
            <Unlink className="size-3.5" aria-hidden />
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Inline create row ────────────────────────────────────────────────────────

interface InlineCreateProps {
  projectId: string;
  taskId: string;
  onDone: () => void;
}

function InlineCreate({ projectId, taskId, onDone }: InlineCreateProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const { mutate: createSubtask, isPending } = useCreateSubtask(
    projectId,
    taskId,
  );

  // Auto-focus when the row mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit() {
    const trimmed = title.trim();
    if (!trimmed) {
      onDone();
      return;
    }
    createSubtask(
      { title: trimmed },
      {
        onSuccess: () => {
          setTitle("");
          // Keep the input open for rapid sequential entry
          inputRef.current?.focus();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      onDone();
    }
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1.5">
      {isPending ? (
        <Spinner className="size-4 shrink-0 text-muted-foreground" />
      ) : (
        <span className="size-4 shrink-0" aria-hidden />
      )}
      <Input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onDone}
        placeholder="Subtask title…"
        className="h-7 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
        disabled={isPending}
        aria-label="New subtask title"
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface TaskSubtaskListProps {
  projectId: string;
  taskId: string;
  /**
   * Called when the user clicks the ExternalLink icon on a subtask row.
   * Receives the child task ID. The caller (TaskDetailTabs) is responsible
   * for opening the drawer — useTaskDrawer is not imported here directly
   * so this component stays decoupled from the drawer shell.
   */
  onOpenTask: (childTaskId: string) => void;
}

export function TaskSubtaskList({
  projectId,
  taskId,
  onOpenTask,
}: TaskSubtaskListProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { data, isLoading } = useTaskSubtasks(projectId, taskId);
  const subtasks = data?.data ?? [];

  const doneCount = subtasks.filter(
    (s) => s.childTask.status === TaskStatus.DONE,
  ).length;
  const total = subtasks.length;
  const progressPercent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Progress bar — only rendered when there is at least one subtask */}
      {!isLoading && total > 0 && (
        <div className="flex items-center gap-3">
          <Progress
            value={progressPercent}
            className="h-1.5 flex-1"
            aria-label={`${doneCount} of ${total} subtasks completed`}
          />
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {doneCount}/{total}
          </span>
        </div>
      )}

      {/* Subtask list */}
      {isLoading ? (
        <div
          className="flex flex-col"
          aria-busy="true"
          aria-label="Loading subtasks"
        >
          <SubtaskSkeleton />
          <SubtaskSkeleton />
          <SubtaskSkeleton />
        </div>
      ) : total === 0 && !isCreating ? (
        <Empty className="border-dashed py-8">
          <EmptyHeader>
            <EmptyMedia>
              <ListTodo className="size-8 text-muted-foreground" aria-hidden />
            </EmptyMedia>
            <EmptyTitle>No subtasks yet</EmptyTitle>
            <EmptyDescription>
              Break this task into smaller steps.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div
          role="list"
          aria-label="Subtasks"
          className="flex flex-col"
        >
          {subtasks.map((subtask) => (
            <div key={subtask.childTaskId} role="listitem">
              <SubtaskRow
                subtask={subtask}
                projectId={projectId}
                parentTaskId={taskId}
                onOpen={onOpenTask}
              />
            </div>
          ))}
        </div>
      )}

      {/* Inline create row */}
      {isCreating && (
        <InlineCreate
          projectId={projectId}
          taskId={taskId}
          onDone={() => setIsCreating(false)}
        />
      )}

      {/* Add subtask button */}
      {!isCreating && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => setIsCreating(true)}
        >
          <Plus className="size-4" aria-hidden />
          Add subtask
        </Button>
      )}
    </div>
  );
}