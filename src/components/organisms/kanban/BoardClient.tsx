"use client";

import { useState } from "react";
import { TaskStatus } from "@/app/generated/prisma/client";
import { TaskWithMeta, GetTasksParams } from "@/features/admin/tasks/api";
import { KanbanBoard } from "./KanbanBoard";
import { KanbanToolbar } from "./KanbanToolbar";

interface BoardClientProps {
  projectId: string;
  onCardClick?: (task: TaskWithMeta) => void;
  onAddTask?: (status: TaskStatus) => void;
}

/**
 * Client shell that owns the board's filter state.
 *
 * Why this component exists:
 *   KanbanToolbar and KanbanBoard both need to share `params` state — the
 *   toolbar writes it, the board reads it. State requires a Client Component.
 *   The page at `board/page.tsx` is an async Server Component (it awaits
 *   `params` for the project id), so it cannot hold useState. This thin
 *   wrapper sits between the Server Component page and the client components,
 *   owning only the filter state and nothing else.
 *
 * State design:
 *   `filterParams` starts empty (`{}`). useAdminTasks treats all fields as
 *   optional and omitted fields mean "no filter". The toolbar spreads changes
 *   into the existing params object so multiple filters compose cleanly:
 *     { search: "auth" } + priority filter → { search: "auth", priority: "HIGH" }
 */
export function BoardClient({
  projectId,
  onCardClick,
  onAddTask,
}: BoardClientProps) {
  const [filterParams, setFilterParams] = useState<GetTasksParams>({});

  return (
    <>
      <KanbanToolbar params={filterParams} onChange={setFilterParams} />
      <KanbanBoard
        projectId={projectId}
        params={filterParams}
        onCardClick={onCardClick}
        onAddTask={onAddTask}
      />
    </>
  );
}
