"use client";

import { useState } from "react";
import { TaskStatus } from "@/app/generated/prisma/client";
import { TaskWithMeta, GetTasksParams } from "@/features/admin/tasks/api";
import { KanbanBoard } from "./KanbanBoard";
import { KanbanToolbar } from "./KanbanToolbar";
import { CreateTaskSheet } from "./CreateTaskSheet";

import { useTaskDrawer } from "@/features/admin/tasks/drawer/hooks/useTaskDrawer";
import { LabelManager } from "@/features/admin/tasks/labels/components";
import { Button } from "@/components/atoms/button";

interface BoardClientProps {
  projectId: string;
  onCardClick?: (task: TaskWithMeta) => void;
}

export function BoardClient({ projectId, onCardClick }: BoardClientProps) {
  const [filterParams, setFilterParams] = useState<GetTasksParams>({});
  const { open } = useTaskDrawer();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetStatus, setSheetStatus] = useState<TaskStatus>("BACKLOG");

  function handleAddTask(status: TaskStatus) {
    setSheetStatus(status);
    setSheetOpen(true);
  }

  return (
    <>
      <div className="flex gap-2">
        <KanbanToolbar params={filterParams} onChange={setFilterParams} />
        <CreateTaskSheet
          projectId={projectId}
          open={sheetOpen}
          defaultStatus={sheetStatus}
          onOpenChange={setSheetOpen}
        />
        <Button onClick={() => setSheetOpen(true)}>Create Tasks</Button>
        <LabelManager projectId={projectId}>
          <Button variant="outline">Manage Labels</Button>
        </LabelManager>
      </div>
      <KanbanBoard
        projectId={projectId}
        params={filterParams}
        onCardClick={(task) => {
          open(task.id);
          if (onCardClick) onCardClick(task);
        }}
        onAddTask={handleAddTask}
      />
    </>
  );
}
