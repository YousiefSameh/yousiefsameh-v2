"use client";

import { useMemo } from "react";
import {
  DragDropProvider,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/react";
import type { DragStartEvent, DragOverEvent, DragEndEvent } from "@dnd-kit/dom";
import { useAdminTasks } from "@/features/admin/tasks/hooks";
import { TaskWithMeta, GetTasksParams } from "@/features/admin/tasks/api";
import { TaskStatus } from "@/app/generated/prisma/client";
import { KANBAN_COLUMN_ORDER } from "@/lib/kanban/constants";
import { groupTasksByStatus } from "@/lib/kanban/groupTasksByStatus";
import { useKanbanDnd } from "@/features/admin/tasks/kanban/useKanbanDnd";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";

interface KanbanBoardProps {
  projectId: string;
  params?: GetTasksParams;
  onCardClick?: (task: TaskWithMeta) => void;
  onAddTask?: (status: TaskStatus) => void;
}

/**
 * Thin wrapper that attaches useDraggable to a KanbanCard.
 */
interface DraggableCardProps {
  projectId: string;
  task: TaskWithMeta;
  onClick?: (task: TaskWithMeta) => void;
}

function DraggableCard({ projectId, task, onClick }: DraggableCardProps) {
  const { ref, isDragging } = useDraggable({
    id: task.id,
    data: task,
  });

  return (
    <KanbanCard
      projectId={projectId}
      ref={ref}
      task={task}
      isDragging={isDragging}
      onClick={onClick}
    />
  );
}

/**
 * Thin wrapper that attaches useDroppable to KanbanColumn's card-list area. Each column uses its TaskStatus string as the droppable ID. This is the same value `resolveDrop` uses to detect column-vs-card drops — the contract between the two must remain in sync.
 */
interface DroppableColumnProps {
  status: TaskStatus;
  tasks: TaskWithMeta[];
  isLoading: boolean;
  overId: string | null;
  onAddTask?: (status: TaskStatus) => void;
  onCardClick?: (task: TaskWithMeta) => void;
  projectId: string;
}

function DroppableColumn({
  status,
  tasks,
  isLoading,
  overId,
  onAddTask,
  onCardClick,
  projectId,
}: DroppableColumnProps) {
  const { ref, isDropTarget } = useDroppable({ id: status });

  const isOver = isDropTarget || overId === status;

  return (
    <KanbanColumn
      ref={ref}
      status={status}
      tasks={tasks}
      isLoading={isLoading}
      isOver={isOver}
      onAddTask={onAddTask}
      onCardClick={onCardClick}
      renderCard={(task) => (
        <DraggableCard key={task.id} projectId={projectId} task={task} onClick={onCardClick} />
      )}
    />
  );
}

/**
 * The Kanban board — the integration layer connecting:
 *   useAdminTasks → groupTasksByStatus → DroppableColumn × 5 → DraggableCard × N
 *
 * This is the only component that imports @dnd-kit/react primitives directly
 * (via DraggableCard and DroppableColumn above). All mutation logic lives in
 * useKanbanDnd; all layout logic lives in KanbanColumn; all card rendering in
 * KanbanCard. This component is purely the wiring.
 *
 * useMemo / ref sync:
 *   groupTasksByStatus is memoised on `tasks`. updateColumnMapRef is called
 *   at render time (not inside useMemo) to keep the DnD hook's ref in sync
 *   without introducing a side effect inside a pure memo computation.
 */
export function KanbanBoard({
  projectId,
  params,
  onCardClick,
  onAddTask,
}: KanbanBoardProps) {
  const { data, isLoading } = useAdminTasks(projectId, params);
  const tasks = useMemo(() => data?.data ?? [], [data]);

  const {
    dragState,
    updateColumnMapRef,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useKanbanDnd({ projectId });

  const columnMap = useMemo(() => groupTasksByStatus(tasks), [tasks]);

  updateColumnMapRef(tasks);

  function onDragStart(event: DragStartEvent) {
    const task = event.operation.source?.data as TaskWithMeta | undefined;
    if (task) handleDragStart(task);
  }

  function onDragOver(event: DragOverEvent) {
    const targetId = event.operation.target?.id;
    handleDragOver(targetId != null ? String(targetId) : null);
  }

  function onDragEnd(event: DragEndEvent) {
    if (event.canceled) {
      handleDragCancel();
      return;
    }

    const draggedId = event.operation.source?.id;
    const targetId = event.operation.target?.id;

    if (draggedId != null) {
      handleDragEnd(
        String(draggedId),
        targetId != null ? String(targetId) : null,
        false,
      );
    }
  }

  return (
    <DragDropProvider
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex h-full w-full gap-4 overflow-x-auto pb-4 pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
        {KANBAN_COLUMN_ORDER.map((status) => (
          <DroppableColumn
            key={status}
            status={status}
            tasks={columnMap[status]}
            isLoading={isLoading}
            overId={dragState.overId}
            onAddTask={onAddTask}
            onCardClick={onCardClick}
            projectId={projectId}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {dragState.activeTask ? (
          <KanbanCard projectId={projectId} task={dragState.activeTask} isOverlay />
        ) : null}
      </DragOverlay>
    </DragDropProvider>
  );
}
