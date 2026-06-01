import { TaskStatus } from "@/app/generated/prisma/client";
import { TaskWithMeta } from "@/features/admin/tasks/api";
import { KANBAN_COLUMN_ORDER } from "./constants";

/**
 * A column map: every TaskStatus key is always present, even when empty.
 *
 * Guaranteeing all keys exist means:
 * - DnD droppables can register on mount without conditional logic.
 * - `KANBAN_COLUMN_ORDER.map(status => columnMap[status])` is always safe.
 * - No null-checks needed at render time.
 */
export type KanbanColumnMap = Record<TaskStatus, TaskWithMeta[]>;

/**
 * Groups a flat task array into a KanbanColumnMap keyed by TaskStatus.
 *
 * Design decisions:
 * - Input order is preserved within each bucket. The API already returns
 *   tasks sorted by [status asc, displayOrder asc, createdAt asc], so the
 *   per-column order is correct without any additional sorting here.
 * - Tasks whose status is not in KANBAN_COLUMN_ORDER are silently dropped.
 *   This guards against future schema additions without crashing the board.
 * - Pure function with no side effects — safe to call inside useMemo.
 *
 * @param tasks  Flat array from useAdminTasks (pre-sorted by the API).
 * @returns      A map with one key per TaskStatus, each value an ordered array.
 */
export function groupTasksByStatus(tasks: TaskWithMeta[]): KanbanColumnMap {
  // Initialise every bucket as an empty array so all keys always exist.
  const map = Object.fromEntries(
    KANBAN_COLUMN_ORDER.map((status) => [status, [] as TaskWithMeta[]]),
  ) as KanbanColumnMap;

  for (const task of tasks) {
    if (task.status && task.status in map) {
      map[task.status].push(task);
    }
  }

  return map;
}