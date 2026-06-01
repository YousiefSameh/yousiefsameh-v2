import { TaskStatus } from "@/app/generated/prisma/client";
import { KanbanColumnMap } from "./groupTasksByStatus";

export interface ResolvedDrop {
  status: TaskStatus;
  orderedTaskIds: string[];
}

/**
 * Resolves a DnD drop event into the payload required by the move API.
 *
 * The move API expects:
 *   POST /projects/:id/tasks/:taskId/move
 *   { status: TaskStatus, orderedTaskIds: string[] }
 *
 * `orderedTaskIds` must be the complete ordered list of task IDs in the
 * *destination* column after the move, including the dragged task inserted
 * at its new position. The API re-indexes displayOrder from this array.
 *
 * @param draggedTaskId  ID of the task being moved.
 * @param targetId       Droppable ID — either a TaskStatus string (column drop) or a task ID (card drop for between-card insertion).
 * @param columnMap      Current snapshot of the board's column state.
 * @param insertBefore   When targetId is a card, insert the dragged task *before* that card rather than after it.
 * @returns              The resolved payload, or null if the drop is a no-op (same column, same position — no API call needed).
 */
export function resolveDrop(
  draggedTaskId: string,
  targetId: string,
  columnMap: KanbanColumnMap,
  insertBefore: boolean,
): ResolvedDrop | null {
  // 1. Determine target status and destination column tasks

  const isColumnTarget = (targetId as string) in columnMap;

  let targetStatus: TaskStatus;
  let destinationTasks: string[]; // ordered IDs of tasks currently in target column

  if (isColumnTarget) {
    // Dropped on the column background — append to end of column.
    targetStatus = targetId as TaskStatus;
    destinationTasks = columnMap[targetStatus].map((t) => t.id);
  } else {
    // Dropped on a card — find which column that card lives in.
    const entry = (
      Object.entries(columnMap) as [TaskStatus, KanbanColumnMap[TaskStatus]][]
    ).find(([, tasks]) => tasks.some((t) => t.id === targetId));

    if (!entry) {
      // Target card not found in any column — bail out safely.
      return null;
    }

    [targetStatus,  ] = entry;
    destinationTasks = entry[1].map((t) => t.id);
  }

  // 2. Build the new ordered ID list

  // Remove the dragged task from the destination list first.
  // It may already be there (same-column reorder) or not (cross-column move).
  const withoutDragged = destinationTasks.filter((id) => id !== draggedTaskId);

  let orderedTaskIds: string[];

  if (isColumnTarget) {
    // Column drop → always append to the end.
    orderedTaskIds = [...withoutDragged, draggedTaskId];
  } else {
    // Card drop → insert relative to the target card.
    const targetIndex = withoutDragged.indexOf(targetId);

    if (targetIndex === -1) {
      // Target card was the dragged card itself after removal — append.
      orderedTaskIds = [...withoutDragged, draggedTaskId];
    } else {
      const insertAt = insertBefore ? targetIndex : targetIndex + 1;
      orderedTaskIds = [
        ...withoutDragged.slice(0, insertAt),
        draggedTaskId,
        ...withoutDragged.slice(insertAt),
      ];
    }
  }

  // 3. No-op detection

  // Find the task's current column.
  const sourceEntry = (
    Object.entries(columnMap) as [TaskStatus, KanbanColumnMap[TaskStatus]][]
  ).find(([, tasks]) => tasks.some((t) => t.id === draggedTaskId));

  if (sourceEntry) {
    const [sourceStatus] = sourceEntry;
    const currentOrder = columnMap[sourceStatus].map((t) => t.id);

    if (
      sourceStatus === targetStatus &&
      orderedTaskIds.join(",") === currentOrder.join(",")
    ) {
      // Position is identical — skip the network call entirely.
      return null;
    }
  }

  return { status: targetStatus, orderedTaskIds };
}