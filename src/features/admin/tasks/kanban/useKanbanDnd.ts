"use client";

import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TaskWithMeta, TasksResponse, moveTask } from "@/features/admin/tasks/api";
import { taskKeys } from "@/features/admin/tasks/hooks";
import { KanbanColumnMap, groupTasksByStatus } from "@/lib/kanban/groupTasksByStatus";
import { resolveDrop } from "@/lib/kanban/kanbanDnd";

interface UseKanbanDndOptions {
  projectId: string;
}

export interface DragState {
  activeTask: TaskWithMeta | null;
  overId: string | null;
}

/**
 * Manages all drag-and-drop state and side effects for the Kanban board.
 *
 * Responsibilities:
 * 1. Tracks active drag state (activeTask, overId) for visual feedback.
 * 2. Keeps a ref-based snapshot of the current column map so drag callbacks
 *    always read the latest column state without stale closures.
 * 3. On drag end: resolves the drop via resolveDrop(), applies an optimistic
 *    cache update, fires the move API, and rolls back + toasts on failure.
 */
export function useKanbanDnd({ projectId }: UseKanbanDndOptions) {
  const qc = useQueryClient();

  const [dragState, setDragState] = useState<DragState>({
    activeTask: null,
    overId:     null,
  });

  const columnMapRef = useRef<KanbanColumnMap>({} as KanbanColumnMap);

  const updateColumnMapRef = useCallback((tasks: TaskWithMeta[]) => {
    columnMapRef.current = groupTasksByStatus(tasks);
  }, []);

  const handleDragStart = useCallback((task: TaskWithMeta) => {
    setDragState({ activeTask: task, overId: null });
  }, []);

  const handleDragOver = useCallback((overId: string | null) => {
    setDragState((prev) => ({ ...prev, overId }));
  }, []);

  const handleDragCancel = useCallback(() => {
    setDragState({ activeTask: null, overId: null });
  }, []);

  /**
   * Called by KanbanBoard when a drag ends over a valid drop target.
   *
   * Flow:
   *   1. Clear drag visual state immediately (no flicker).
   *   2. Resolve the drop via resolveDrop() — returns null for no-ops.
   *   3. Snapshot all active task list queries for potential rollback.
   *   4. Apply optimistic cache update.
   *   5. Fire the network request.
   *   6. On failure: restore the snapshot and show an error toast.
   *   7. On settle (success or failure): invalidate to sync with server.
   */
  const handleDragEnd = useCallback(
    async (
      draggedTaskId: string,
      targetId:      string | null,
      insertBefore:  boolean,
    ) => {
      // 1. Clear drag state immediately — don't wait for the async path
      setDragState({ activeTask: null, overId: null });

      // No valid drop target (dropped outside the board)
      if (!targetId) return;

      // 2. Resolve the drop
      const resolution = resolveDrop(
        draggedTaskId,
        targetId,
        columnMapRef.current,
        insertBefore,
      );

      // No-op: task dropped back to its original position
      if (!resolution) return;

      const { status, orderedTaskIds } = resolution;

      // 3. Cancel any in-flight fetches and snapshot ALL task list queries under this project (covers filtered and unfiltered variants).
      const allTasksKey = taskKeys.all(projectId);
      await qc.cancelQueries({ queryKey: allTasksKey });

      const snapshots = qc.getQueriesData<TasksResponse>({
        queryKey: allTasksKey,
      });

      // 4. Optimistic update
      snapshots.forEach(([key, cached]) => {
        if (!cached?.data) return;

        // Build the updated flat task array
        const updated = cached.data.map((t) =>
          t.id === draggedTaskId ? { ...t, status } : t,
        );

        // Re-sort to reflect the new displayOrder within the destination column.
        // Sorting rules:
        //   - Tasks in the destination column that are in orderedTaskIds: sort by their position in orderedTaskIds.
        //   - All other tasks: preserve their existing relative order by keeping their original array index (stable sort guarantee from V8).
        updated.sort((a, b) => {
          const aInDest = a.status === status && orderedTaskIds.includes(a.id);
          const bInDest = b.status === status && orderedTaskIds.includes(b.id);

          if (aInDest && bInDest) {
            return orderedTaskIds.indexOf(a.id) - orderedTaskIds.indexOf(b.id);
          }
          // Keep tasks from different columns in their original relative order.
          // The stable sort preserves insertion order for equal comparisons.
          return 0;
        });

        qc.setQueryData<TasksResponse>(key, { ...cached, data: updated });
      });

      // 5. Fire the network request
      try {
        await moveTask(projectId, draggedTaskId, { status, orderedTaskIds });
      } catch {
        // 6. Rollback: restore every snapshotted query to its previous state
        snapshots.forEach(([key, cached]) => qc.setQueryData(key, cached));
        toast.error("Failed to move task. Please try again.");
      } finally {
        // 7. Always revalidate — confirms optimistic state or applies rollback
        qc.invalidateQueries({ queryKey: allTasksKey });
      }
    },
    // projectId and qc are the only true external dependencies.
    // columnMapRef is a ref (stable identity), not listed.
    // resolveDrop, groupTasksByStatus, taskKeys are module-level — not listed.
    [projectId, qc],
  );

  return {
    dragState,
    updateColumnMapRef,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}